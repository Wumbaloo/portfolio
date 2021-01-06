from setuptools import setup

setup(
    name='portfolio',
    packages=['portfolio'],
    include_package_data=True,
    install_requires=[
        'flask',
        'redis'
    ],
)