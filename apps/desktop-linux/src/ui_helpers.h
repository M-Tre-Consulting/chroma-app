/**
 * @file ui_helpers.h
 * @brief Helper utility functions and templated callback connect wrappers for GTK/GObject signal handling.
 */

#ifndef CHROMA_UI_HELPERS_H
#define CHROMA_UI_HELPERS_H

#include <gtk/gtk.h>
#include <string>
#include <type_traits>

/**
 * @brief Utility function to apply raw CSS styles to a specific GTK widget.
 * 
 * Uses a dynamic GtkCssProvider loaded with the given styles and registers it 
 * at the application-level priority.
 * 
 * @param widget The GTK widget to style.
 * @param css The raw CSS rules string.
 */
void apply_widget_css(GtkWidget* widget, const char* css);

/**
 * @brief Utility function to set uniform margins (top, bottom, start, end) on a GTK widget.
 * 
 * @param widget The GTK widget to update.
 * @param margin The margin size in pixels.
 */
void set_margin_all(GtkWidget* widget, int margin);

/**
 * @brief Connects a C++ callable (lambda) to the "clicked" signal of a GtkButton.
 * 
 * Automatically handles the life-cycle of the lambda closure by allocating it on the heap 
 * and deleting it when the signal connection is finalized or destroyed.
 * 
 * @tparam F Type of the callable/lambda.
 * @param button The target GtkButton widget.
 * @param lambda The callback closure (must accept `GtkButton*` as first parameter, or take it implicitly).
 */
template<typename F>
void connect_clicked(GtkWidget* button, F&& lambda) {
    auto* func = new std::decay_t<F>(std::forward<F>(lambda));
    void (*callback)(GtkButton*, gpointer) = [](GtkButton* btn, gpointer data) {
        auto* f = static_cast<std::decay_t<F>*>(data);
        (*f)(btn);
    };
    g_signal_connect_data(button, "clicked", G_CALLBACK(callback), func, [](gpointer data, GClosure*) {
        delete static_cast<std::decay_t<F>*>(data);
    }, (GConnectFlags)0);
}

/**
 * @brief Connects a C++ callable (lambda) to the "changed" signal of a GtkEditable (e.g., GtkEntry).
 * 
 * Automatically manages heap life-cycle for the callback closure.
 * 
 * @tparam F Type of the callable/lambda.
 * @param editable The target GtkEditable widget.
 * @param lambda The callback closure (must accept `GtkEditable*` as first parameter).
 */
template<typename F>
void connect_changed(GtkWidget* editable, F&& lambda) {
    auto* func = new std::decay_t<F>(std::forward<F>(lambda));
    void (*callback)(GtkEditable*, gpointer) = [](GtkEditable* edit, gpointer data) {
        auto* f = static_cast<std::decay_t<F>*>(data);
        (*f)(edit);
    };
    g_signal_connect_data(editable, "changed", G_CALLBACK(callback), func, [](gpointer data, GClosure*) {
        delete static_cast<std::decay_t<F>*>(data);
    }, (GConnectFlags)0);
}

/**
 * @brief Connects a C++ callable (lambda) to the "activate" signal of a GtkEntry (triggered on Enter key).
 * 
 * Automatically manages heap life-cycle for the callback closure.
 * 
 * @tparam F Type of the callable/lambda.
 * @param entry The target GtkEntry widget.
 * @param lambda The callback closure (must accept `GtkEntry*` as first parameter).
 */
template<typename F>
void connect_activate(GtkWidget* entry, F&& lambda) {
    auto* func = new std::decay_t<F>(std::forward<F>(lambda));
    void (*callback)(GtkEntry*, gpointer) = [](GtkEntry* ent, gpointer data) {
        auto* f = static_cast<std::decay_t<F>*>(data);
        (*f)(ent);
    };
    g_signal_connect_data(entry, "activate", G_CALLBACK(callback), func, [](gpointer data, GClosure*) {
        delete static_cast<std::decay_t<F>*>(data);
    }, (GConnectFlags)0);
}

/**
 * @brief Connects a C++ callable (lambda) to the "changed" signal of a GtkComboBox.
 * 
 * Automatically manages heap life-cycle for the callback closure.
 * 
 * @tparam F Type of the callable/lambda.
 * @param combo The target GtkComboBox widget.
 * @param lambda The callback closure (must accept `GtkComboBox*` as first parameter).
 */
template<typename F>
void connect_combo_changed(GtkWidget* combo, F&& lambda) {
    auto* func = new std::decay_t<F>(std::forward<F>(lambda));
    void (*callback)(GtkComboBox*, gpointer) = [](GtkComboBox* cmb, gpointer data) {
        auto* f = static_cast<std::decay_t<F>*>(data);
        (*f)(cmb);
    };
    g_signal_connect_data(combo, "changed", G_CALLBACK(callback), func, [](gpointer data, GClosure*) {
        delete static_cast<std::decay_t<F>*>(data);
    }, (GConnectFlags)0);
}

/**
 * @brief Connects a C++ callable (lambda) to the "row-selected" signal of a GtkListBox.
 * 
 * Automatically manages heap life-cycle for the callback closure.
 * 
 * @tparam F Type of the callable/lambda.
 * @param listbox The target GtkListBox widget.
 * @param lambda The callback closure (must accept `GtkListBox*, GtkListBoxRow*` as parameters).
 */
template<typename F>
void connect_row_selected(GtkWidget* listbox, F&& lambda) {
    auto* func = new std::decay_t<F>(std::forward<F>(lambda));
    void (*callback)(GtkListBox*, GtkListBoxRow*, gpointer) = [](GtkListBox* lb, GtkListBoxRow* row, gpointer data) {
        auto* f = static_cast<std::decay_t<F>*>(data);
        (*f)(lb, row);
    };
    g_signal_connect_data(listbox, "row-selected", G_CALLBACK(callback), func, [](gpointer data, GClosure*) {
        delete static_cast<std::decay_t<F>*>(data);
    }, (GConnectFlags)0);
}

/**
 * @brief Connects a C++ callable (lambda) to a detailed object property change notification ("notify::[property_name]").
 * 
 * Automatically manages heap life-cycle for the callback closure.
 * 
 * @tparam F Type of the callable/lambda.
 * @param widget The target GtkWidget (GObject).
 * @param property_name Name of the property to monitor (e.g. "show-editor").
 * @param lambda The callback closure (must accept `GObject*` as parameter).
 */
template<typename F>
void connect_notify(GtkWidget* widget, const char* property_name, F&& lambda) {
    std::string detailed_signal = "notify::" + std::string(property_name);
    auto* func = new std::decay_t<F>(std::forward<F>(lambda));
    void (*callback)(GObject*, GParamSpec*, gpointer) = [](GObject* obj, GParamSpec* pspec, gpointer data) {
        auto* f = static_cast<std::decay_t<F>*>(data);
        (*f)(obj);
    };
    g_signal_connect_data(widget, detailed_signal.c_str(), G_CALLBACK(callback), func, [](gpointer data, GClosure*) {
        delete static_cast<std::decay_t<F>*>(data);
    }, (GConnectFlags)0);
}

#endif // CHROMA_UI_HELPERS_H
