package io.github.saeeddev94.xray.activity

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import io.github.saeeddev94.xray.R
import io.github.saeeddev94.xray.Settings
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.isActive

/**
 * Activity for selecting which apps to exclude from the VPN
 * This lets users choose which apps will bypass the VPN connection
 */
class AppSelectionActivity : AppCompatActivity() {
    
    // UI components
    private lateinit var recyclerView: RecyclerView
    private lateinit var progressView: View
    private lateinit var appsAdapter: AppListAdapter
    
    // List to store all installed apps
    private val appsList = mutableListOf<AppInfo>()
    
    // List to store currently selected apps (to be excluded from VPN)
    private val selectedPackages = mutableSetOf<String>()
    
    // Background scope for loading apps
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_app_selection)
        
        // Set up ActionBar with back button
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            title = getString(R.string.app_selection_title)
        }
        
        // Initialize UI components
        recyclerView = findViewById(R.id.recyclerViewApps)
        progressView = findViewById(R.id.progressBarApps)
        
        // Set up RecyclerView
        recyclerView.layoutManager = LinearLayoutManager(this)
        appsAdapter = AppListAdapter(appsList) { app, isChecked ->
            onAppSelectionChanged(app, isChecked)
        }
        recyclerView.adapter = appsAdapter
        
        // Load current app selection from settings
        loadCurrentSelection()
        
        // Load installed apps in background
        loadInstalledApps()
    }
    
    /**
     * Loads the currently selected apps from Settings
     */
    private fun loadCurrentSelection() {
        selectedPackages.clear()
        
        // Get currently excluded apps from Settings
        val excludedApps = Settings.appsRouting.split("\n")
        selectedPackages.addAll(excludedApps.filter { it.isNotBlank() })
    }
    
    /**
     * Loads all installed apps in a background thread
     */
    private fun loadInstalledApps() {
        // Show progress indicator
        progressView.visibility = View.VISIBLE
        recyclerView.visibility = View.GONE
        
        scope.launch {
            // Get the package manager
            val pm = packageManager
            
            // Get all installed apps
            val installedApps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            if (!isActive) {
                return@launch
            }
            
            // Filter and sort apps
            val sortedApps = installedApps
                .filter { info -> pm.getLaunchIntentForPackage(info.packageName) != null } // Only launchable apps
                .sortedBy { info -> pm.getApplicationLabel(info).toString() } // Sort by name
                .map { info ->
                    AppInfo(
                        packageName = info.packageName,
                        appName = pm.getApplicationLabel(info).toString(),
                        icon = pm.getApplicationIcon(info.packageName),
                        isSystemApp = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
                        isSelected = selectedPackages.contains(info.packageName)
                    )
                }
            
            // Update UI on main thread
            withContext(Dispatchers.Main) {
                if (!isActive) {
                    return@withContext
                }
                appsList.clear()
                appsList.addAll(sortedApps)
                appsAdapter.notifyDataSetChanged()
                
                // Hide progress indicator
                progressView.visibility = View.GONE
                recyclerView.visibility = View.VISIBLE
            }
        }
    }
    
    /**
     * Handles when an app's selection state changes
     * 
     * @param app The app whose selection state changed
     * @param isChecked Whether the app is now checked (selected to be excluded from VPN)
     */
    private fun onAppSelectionChanged(app: AppInfo, isChecked: Boolean) {
        if (isChecked) {
            selectedPackages.add(app.packageName)
        } else {
            selectedPackages.remove(app.packageName)
        }
        
        // Save changes immediately
        saveSelection()
    }
    
    /**
     * Saves the current selection to Settings
     */
    private fun saveSelection() {
        // Convert selected packages to newline-separated string
        val appsString = selectedPackages.joinToString("\n")
        
        // Save to Settings
        Settings.appsRouting = appsString
        Settings.sync(this)
    }
    
    /**
     * Handles action bar item clicks (specifically the back button)
     */
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }
    
    /**
     * Inner class representing app information
     */
    data class AppInfo(
        val packageName: String,
        val appName: String,
        val icon: android.graphics.drawable.Drawable,
        val isSystemApp: Boolean,
        var isSelected: Boolean
    )
    
    /**
     * Adapter for the RecyclerView that displays the list of apps
     */
    inner class AppListAdapter(
        private val apps: List<AppInfo>,
        private val onItemCheckedChange: (AppInfo, Boolean) -> Unit
    ) : RecyclerView.Adapter<AppListAdapter.AppViewHolder>() {
        
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AppViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_app, parent, false)
            return AppViewHolder(view)
        }
        
        override fun onBindViewHolder(holder: AppViewHolder, position: Int) {
            val app = apps[position]
            holder.bind(app)
        }
        
        override fun getItemCount() = apps.size
        
        inner class AppViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            private val iconView: ImageView = itemView.findViewById(R.id.appIcon)
            private val nameView: TextView = itemView.findViewById(R.id.appName)
            private val packageNameView: TextView = itemView.findViewById(R.id.appPackage)
            private val checkBox: CheckBox = itemView.findViewById(R.id.appCheckbox)
            
            fun bind(app: AppInfo) {
                // Set app details
                iconView.setImageDrawable(app.icon)
                nameView.text = app.appName
                packageNameView.text = app.packageName
                
                // Set initial checkbox state without triggering listener
                checkBox.setOnCheckedChangeListener(null)
                checkBox.isChecked = app.isSelected
                
                // Set click listeners for the whole item and checkbox
                checkBox.setOnCheckedChangeListener { _, isChecked ->
                    app.isSelected = isChecked
                    onItemCheckedChange(app, isChecked)
                }
                
                itemView.setOnClickListener {
                    val newState = !checkBox.isChecked
                    checkBox.isChecked = newState
                    app.isSelected = newState
                    onItemCheckedChange(app, newState)
                }
            }
        }
    }
}
