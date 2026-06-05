cmake_minimum_required(VERSION 3.12)
project(Chroma LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Get version from Git tag, fallback to 1.0.0
find_package(Git QUIET)
if(GIT_FOUND)
    execute_process(
        COMMAND ${GIT_EXECUTABLE} describe --tags --always --dirty
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
        OUTPUT_VARIABLE APP_VERSION
        OUTPUT_STRIP_TRAILING_WHITESPACE
        ERROR_QUIET
    )
endif()

if(NOT APP_VERSION)
    set(APP_VERSION "1.0.0")
endif()

message(STATUS "Chroma Application Version: ${APP_VERSION}")
add_compile_definitions(CHROMA_VERSION="${APP_VERSION}")


# Find dependencies using PkgConfig
find_package(PkgConfig REQUIRED)

pkg_check_modules(GTK4 REQUIRED IMPORTED_TARGET gtk4)
pkg_check_modules(ADWAITA REQUIRED IMPORTED_TARGET libadwaita-1)
pkg_check_modules(JSONCPP REQUIRED IMPORTED_TARGET jsoncpp)

# Compile resources
find_program(GLIB_COMPILE_RESOURCES NAMES glib-compile-resources REQUIRED)
set(GRESOURCE_XML ${CMAKE_CURRENT_SOURCE_DIR}/resources.gresource.xml)
set(GRESOURCE_SRC ${CMAKE_CURRENT_BINARY_DIR}/resources.c)

add_custom_command(
    OUTPUT ${GRESOURCE_SRC}
    COMMAND ${GLIB_COMPILE_RESOURCES}
            --target=${GRESOURCE_SRC}
            --sourcedir=${CMAKE_CURRENT_SOURCE_DIR}
            --generate-source
            ${GRESOURCE_XML}
    DEPENDS ${GRESOURCE_XML}
            ${CMAKE_CURRENT_SOURCE_DIR}/../ios/Chroma/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon.png
            ${CMAKE_CURRENT_SOURCE_DIR}/../desktop-windows/ic_launcher.png
            ${CMAKE_CURRENT_SOURCE_DIR}/../android/app/src/main/res/mipmap-mdpi/ic_launcher.png
    VERBATIM
)

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
    ${GRESOURCE_SRC}
)

# Output target name matching original binary
add_executable(desktop-linux ${SOURCES})

# Add include directories
target_include_directories(desktop-linux PRIVATE src)

# Link dependencies
target_link_libraries(desktop-linux PRIVATE
    PkgConfig::GTK4
    PkgConfig::ADWAITA
)

# Attempt to find static jsoncpp for AppImage portability
find_library(JSONCPP_STATIC_LIB NAMES libjsoncpp.a PATHS ${JSONCPP_LIBRARY_DIRS} /usr/lib /usr/lib/x86_64-linux-gnu /usr/local/lib)

if(JSONCPP_STATIC_LIB)
    message(STATUS "Found static jsoncpp library: ${JSONCPP_STATIC_LIB}")
    target_link_libraries(desktop-linux PRIVATE ${JSONCPP_STATIC_LIB})
    target_include_directories(desktop-linux PRIVATE ${JSONCPP_INCLUDE_DIRS})
else()
    message(WARNING "Static jsoncpp library not found. Linking dynamically.")
    target_link_libraries(desktop-linux PRIVATE PkgConfig::JSONCPP)
endif()

