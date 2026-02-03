from setuptools import setup, find_packages

setup(
    name="autotester",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'pycodestyle',
        'radon>=6.0.0',
        'networkx',
        'matplotlib'
    ],
)
