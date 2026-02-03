from setuptools import setup, find_packages

setup(
    name="fastwhisper",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "pytest",
        "soundfile",
        "torch",  # Add torch to the dependencies
        "faster-whisper",
    ],
    python_requires=">=3.8",
    entry_points={
        "console_scripts": [
            "fastwhisper=fastwhisper.main:main",
        ],
    }
)
