#ifndef CHROMA_UI_HELPERS_H
#define CHROMA_UI_HELPERS_H

#include <gtk/gtk.h>
#include <string>
#include <type_traits>

void apply_widget_css(GtkWidget* widget, const char* css);
void set_margin_all(GtkWidget* widget, int margin);

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
