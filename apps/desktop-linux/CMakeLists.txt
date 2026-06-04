cmake_minimum_required(VERSION 3.12)
project(Chroma LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find dependencies using PkgConfig
find_package(PkgConfig REQUIRED)

pkg_check_modules(GTK4 REQUIRED IMPORTED_TARGET gtk4)
pkg_check_modules(ADWAITA REQUIRED IMPORTED_TARGET libadwaita-1)
pkg_check_modules(JSONCPP REQUIRED IMPORTED_TARGET jsoncpp)

# Define sources
set(SOURCES
    src/main.cpp
    src/store.cpp
    src/colour_math.cpp
    src/exporter.cpp
    src/ui_helpers.cpp
    src/palettes_page.cpp
    src/tokens_page.cpp
    src/export_page.cpp
)

# Output target name matching original binary
add_executable(desktop-linux ${SOURCES})

# Add include directories
target_include_directories(desktop-linux PRIVATE src)

# Link dependencies
target_link_libraries(desktop-linux PRIVATE
    PkgConfig::GTK4
    PkgConfig::ADWAITA
    PkgConfig::JSONCPP
)
