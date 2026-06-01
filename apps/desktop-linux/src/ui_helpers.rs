use gtk4 as gtk;
use gtk::glib;
use gtk::prelude::*;

pub fn apply_widget_css(widget: &impl glib::object::IsA<gtk::Widget>, css: &str) {
    let provider = gtk::CssProvider::new();
    provider.load_from_data(css);
    widget.style_context().add_provider(&provider, gtk::STYLE_PROVIDER_PRIORITY_APPLICATION);
}

pub fn set_margin_all(widget: &impl glib::object::IsA<gtk::Widget>, margin: i32) {
    widget.set_margin_start(margin);
    widget.set_margin_end(margin);
    widget.set_margin_top(margin);
    widget.set_margin_bottom(margin);
}
