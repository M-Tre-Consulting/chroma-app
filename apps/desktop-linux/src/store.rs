use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use crate::types::AppState;

pub struct Store {
    path: PathBuf,
}

impl Store {
    pub fn new() -> Self {
        let mut path = PathBuf::from(std::env::var("HOME").unwrap_or_else(|_| ".".to_string()));
        path.push(".config");
        path.push("chroma");
        let _ = fs::create_dir_all(&path);
        path.push("state.json");
        Self { path }
    }

    pub fn load(&self) -> AppState {
        if self.path.exists() {
            if let Ok(file) = File::open(&self.path) {
                if let Ok(state) = serde_json::from_reader(file) {
                    return state;
                }
            }
        }
        AppState {
            palettes: Vec::new(),
            token_groups: Vec::new(),
            active_palette_id: None,
        }
    }

    pub fn save(&self, state: &AppState) {
        if let Ok(mut file) = File::create(&self.path) {
            if let Ok(json) = serde_json::to_string_pretty(state) {
                let _ = file.write_all(json.as_bytes());
            }
        }
    }
}
