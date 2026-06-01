use crate::types::{TokenGroup, Palette};

pub struct ResolvedToken {
    pub name: String,
    pub hex: String,
    pub group: String,
}

fn resolve_tokens(groups: &[TokenGroup], palettes: &[Palette]) -> Vec<ResolvedToken> {
    let mut resolved = Vec::new();
    for g in groups {
        for t in &g.tokens {
            if !t.value.colour_id.is_empty() && !t.value.palette_id.is_empty() {
                let palette = palettes.iter().find(|p| p.id == t.value.palette_id);
                let colour = palette.and_then(|p| p.colours.iter().find(|c| c.id == t.value.colour_id));
                resolved.push(ResolvedToken {
                    name: t.name.clone(),
                    hex: colour.map(|c| c.hex.clone()).unwrap_or_else(|| "#000000".to_string()),
                    group: g.name.clone(),
                });
            }
        }
    }
    resolved
}

pub fn export_css(groups: &[TokenGroup], palettes: &[Palette]) -> String {
    let tokens = resolve_tokens(groups, palettes);
    let entries: Vec<String> = tokens.iter().map(|t| format!("  --{}: {};", t.name, t.hex)).collect();
    format!(":root {{\n{}\n}}", entries.join("\n"))
}

pub fn export_scss(groups: &[TokenGroup], palettes: &[Palette]) -> String {
    let tokens = resolve_tokens(groups, palettes);
    let mut grouped: std::collections::BTreeMap<String, Vec<&ResolvedToken>> = std::collections::BTreeMap::new();
    for t in &tokens {
        grouped.entry(t.group.clone()).or_default().push(t);
    }
    
    let mut sections = Vec::new();
    for (group, ts) in grouped {
        let vars: Vec<String> = ts.iter().map(|t| format!("${}: {};", t.name, t.hex)).collect();
        sections.push(format!("// {}\n{}", group, vars.join("\n")));
    }
    sections.join("\n\n")
}

pub fn export_json(groups: &[TokenGroup], palettes: &[Palette]) -> String {
    let tokens = resolve_tokens(groups, palettes);
    let mut map = serde_json::Map::new();
    
    let mut color_map = serde_json::Map::new();
    for t in tokens {
        let group_entry = color_map.entry(t.group.clone()).or_insert_with(|| serde_json::Value::Object(serde_json::Map::new()));
        if let serde_json::Value::Object(group_obj) = group_entry {
            let mut val_map = serde_json::Map::new();
            val_map.insert("value".to_string(), serde_json::Value::String(t.hex));
            group_obj.insert(t.name.clone(), serde_json::Value::Object(val_map));
        }
    }
    map.insert("color".to_string(), serde_json::Value::Object(color_map));
    serde_json::to_string_pretty(&serde_json::Value::Object(map)).unwrap_or_default()
}

pub fn export_tailwind(groups: &[TokenGroup], palettes: &[Palette]) -> String {
    let tokens = resolve_tokens(groups, palettes);
    let entries: Vec<String> = tokens.iter().map(|t| format!("  '{}': '{}',", t.name, t.hex)).collect();
    format!("// tailwind.config.ts — paste into the colors key\nconst colors = {{\n{}\n}}", entries.join("\n"))
}

pub fn export_android_xml(groups: &[TokenGroup], palettes: &[Palette]) -> String {
    let tokens = resolve_tokens(groups, palettes);
    let entries: Vec<String> = tokens.iter().map(|t| {
        let snake_name = t.name.replace('-', "_");
        format!("  <color name=\"{}\">{}</color>", snake_name, t.hex)
    }).collect();
    format!("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources>\n{}\n</resources>", entries.join("\n"))
}
