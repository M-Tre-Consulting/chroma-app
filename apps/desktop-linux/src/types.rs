use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Colour {
    pub id: String,
    pub name: String,
    pub hex: String,
    pub rgb: Rgb,
    pub hsl: Hsl,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Rgb {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Hsl {
    pub h: i32,
    pub s: i32,
    pub l: i32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Palette {
    pub id: String,
    pub name: String,
    pub colours: Vec<Colour>,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TokenValue {
    #[serde(rename = "colourId")]
    pub colour_id: String,
    #[serde(rename = "paletteId")]
    pub palette_id: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Token {
    pub id: String,
    pub name: String,
    pub description: String,
    pub value: TokenValue,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TokenGroup {
    pub id: String,
    pub name: String,
    pub tokens: Vec<Token>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppState {
    pub palettes: Vec<Palette>,
    #[serde(rename = "tokenGroups")]
    pub token_groups: Vec<TokenGroup>,
    #[serde(rename = "activePaletteId")]
    pub active_palette_id: Option<String>,
}
