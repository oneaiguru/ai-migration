# setup.py
from setuptools import setup, find_packages

setup(
    name="fileselect",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'readchar',
        'rich',
    ],
    entry_points={
        'console_scripts': [
            'fileselect=src.fileselect.main:main',
        ],
    },
)
