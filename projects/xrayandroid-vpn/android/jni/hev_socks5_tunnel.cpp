#include <jni.h>
#include <string>
#include <pthread.h>
#include <android/log.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <time.h>
#include <errno.h>
#include <string.h>
#include <atomic>

// Android logging macros
#define TAG "HevSocks5Tunnel"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

// Declare imported functions from hev-socks5-tunnel library
extern "C" {
    // These functions should be provided by the hev-socks5-tunnel library
    int hev_socks5_tunnel_main(int argc, char *argv[]);
    void hev_socks5_tunnel_quit(void);
    unsigned long long hev_socks5_tunnel_get_tcp_tx_bytes(void);
    unsigned long long hev_socks5_tunnel_get_tcp_rx_bytes(void);
    unsigned long long hev_socks5_tunnel_get_udp_tx_bytes(void);
    unsigned long long hev_socks5_tunnel_get_udp_rx_bytes(void);
}

// Global variables for tunnel management
static pthread_t tunnel_thread = 0;
static std::atomic<int> tunnel_fd{-1};
static std::atomic<bool> is_running{false};
static std::string config_path;

static void close_tunnel_fd(const char *reason) {
    int fd = tunnel_fd.exchange(-1);
    if (fd >= 0) {
        if (close(fd) != 0) {
            LOGE("Failed to close tunnel fd (%s): %s", reason, strerror(errno));
        }
    }
}

/**
 * Thread function to run the hev-socks5-tunnel
 * This runs in a separate thread to avoid blocking the main Java thread
 */
static void* tunnel_thread_func(void *arg) {
    int fd = tunnel_fd.load();
    if (fd < 0) {
        LOGE("Invalid tunnel fd; aborting thread start");
        is_running.store(false);
        return NULL;
    }

    LOGI("Starting hev-socks5-tunnel with config: %s", config_path.c_str());
    
    // Arguments for hev-socks5-tunnel
    // Format: [program_name, -c, config_file_path, -t, tunnel_fd, NULL]
    char tunfd_str[32];
    snprintf(tunfd_str, sizeof(tunfd_str), "%d", fd);
    
    char *argv[] = {
        (char*)"hev-socks5-tunnel",
        (char*)"-c",
        (char*)config_path.c_str(),
        (char*)"-t",
        tunfd_str,
        NULL
    };
    
    // Call the main function of hev-socks5-tunnel
    int result = hev_socks5_tunnel_main(5, argv);
    LOGI("hev-socks5-tunnel exited with code: %d", result);
    
    close_tunnel_fd("thread-exit");
    is_running.store(false);
    return NULL;
}

/**
 * Starts the tunnel service
 * 
 * @param env JNI environment
 * @param thiz The Java object instance
 * @param configPath Path to the YAML configuration file
 * @param fd File descriptor of the TUN device created by VpnService
 */
extern "C" JNIEXPORT jboolean JNICALL
Java_io_github_saeeddev94_xray_service_TProxyService_TProxyStartService(
        JNIEnv *env, jobject thiz, jstring configPath, jint fd) {
    
    // Make sure we're not already running
    bool thread_started = tunnel_thread != 0;
    bool fd_open = tunnel_fd.load() >= 0;
    if (is_running.load() || thread_started || fd_open) {
        LOGI("Tunnel already running or not fully cleaned up, stopping first");
        Java_io_github_saeeddev94_xray_service_TProxyService_TProxyStopService(env, thiz);
    }
    
    // Convert Java string to C++ string
    const char *path_chars = env->GetStringUTFChars(configPath, NULL);
    if (path_chars == NULL) {
        LOGE("Failed to get config path string");
        return JNI_FALSE;
    }
    
    config_path = std::string(path_chars);
    env->ReleaseStringUTFChars(configPath, path_chars);
    
    // Save the tunnel file descriptor
    // Duplicate the fd so the Java side can close its copy independently.
    if (fd < 0) {
        LOGE("Invalid tunnel fd provided");
        return JNI_FALSE;
    }
    int fd_copy = dup(fd);
    if (fd_copy < 0) {
        LOGE("Failed to duplicate tunnel fd: %s", strerror(errno));
        return JNI_FALSE;
    }
    close_tunnel_fd("restart");
    tunnel_fd.store(fd_copy);

    // Create a thread to run the tunnel
    int create_result = pthread_create(&tunnel_thread, NULL, tunnel_thread_func, NULL);
    if (create_result != 0) {
        LOGE("Failed to create tunnel thread: %s", strerror(create_result));
        close_tunnel_fd("thread-create");
        tunnel_thread = 0;
        is_running.store(false);
        return JNI_FALSE;
    }
    is_running.store(true);

    LOGI("Tunnel service started successfully with fd: %d", fd_copy);
    return JNI_TRUE;
}

/**
 * Stops the tunnel service
 *
 * @param env JNI environment
 * @param thiz The Java object instance
 */
extern "C" JNIEXPORT void JNICALL
Java_io_github_saeeddev94_xray_service_TProxyService_TProxyStopService(
        JNIEnv *env, jobject thiz) {
    
    bool thread_started = tunnel_thread != 0;
    bool fd_open = tunnel_fd.load() >= 0;
    if (!is_running.load() && !thread_started && !fd_open) {
        LOGI("Tunnel not running, nothing to stop");
        return;
    }
    
    LOGI("Stopping tunnel service");
    
    if (thread_started) {
        // Signal the tunnel to quit
        hev_socks5_tunnel_quit();

        // Wait for thread to exit, with a timeout when supported by the platform.
        // Fall back to a blocking join when timed joins are unavailable.
        int join_result = 0;
#if defined(__GLIBC__) || (defined(__BIONIC__) && defined(__ANDROID_API__) && __ANDROID_API__ >= 21)
        struct timespec ts;
        if (clock_gettime(CLOCK_REALTIME, &ts) != 0) {
            LOGE("Failed to get time for timed join, falling back to blocking join: %s", strerror(errno));
            join_result = pthread_join(tunnel_thread, NULL);
        } else {
            ts.tv_sec += 5; // 5 second timeout
            join_result = pthread_timedjoin_np(tunnel_thread, NULL, &ts);
        }
#else
        join_result = pthread_join(tunnel_thread, NULL);
#endif
        if (join_result != 0) {
            if (join_result == ETIMEDOUT) {
                LOGE("Timed out waiting for tunnel thread; requesting cancel");
                pthread_cancel(tunnel_thread);
                pthread_join(tunnel_thread, NULL); // Ensure resources are reclaimed
            } else {
                LOGE("Failed to join tunnel thread: %s", strerror(join_result));
            }
        }
    }
    
    // Clean up
    close_tunnel_fd("stop");
    tunnel_thread = 0;
    is_running.store(false);
    
    LOGI("Tunnel service stopped successfully");
}

/**
 * Gets statistics about the tunnel traffic
 *
 * @param env JNI environment
 * @param thiz The Java object instance
 * @return LongArray with [tcp_tx_bytes, tcp_rx_bytes, udp_tx_bytes, udp_rx_bytes]
 */
extern "C" JNIEXPORT jlongArray JNICALL
Java_io_github_saeeddev94_xray_service_TProxyService_TProxyGetStats(
        JNIEnv *env, jobject thiz) {
        
    jlongArray result = env->NewLongArray(4);
    if (result == NULL) {
        return NULL;
    }
    
    // Get statistics from the tunnel
    jlong stats[4];
    if (is_running.load()) {
        stats[0] = (jlong)hev_socks5_tunnel_get_tcp_tx_bytes();
        stats[1] = (jlong)hev_socks5_tunnel_get_tcp_rx_bytes();
        stats[2] = (jlong)hev_socks5_tunnel_get_udp_tx_bytes();
        stats[3] = (jlong)hev_socks5_tunnel_get_udp_rx_bytes();
    } else {
        stats[0] = 0;
        stats[1] = 0;
        stats[2] = 0;
        stats[3] = 0;
    }
    
    env->SetLongArrayRegion(result, 0, 4, stats);
    return result;
}
