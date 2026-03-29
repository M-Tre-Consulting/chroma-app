import { useState } from "react";
import { useTokenStore } from "../../store/tokenStore";
import { usePaletteStore } from "../../store/paletteStore";
import { exportTailwind, exportAndroidXml } from "../../lib/export";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export function TokenPanel() {
    const [newGroupName, setNewGroupName] = useState("");
    const [newTokenNames, setNewTokenNames] = useState<Record<string, string>>(
        {},
    );
    const [copied, setCopied] = useState<string | null>(null);

    const {
        groups,
        addGroup,
        removeGroup,
        addToken,
        removeToken,
        assignColour,
    } = useTokenStore();
    const { palettes } = usePaletteStore();

    const handleAddGroup = () => {
        if (!newGroupName.trim()) return;
        addGroup(newGroupName.trim());
        setNewGroupName("");
    };

    const handleAddToken = (groupId: string) => {
        const name = newTokenNames[groupId]?.trim();
        if (!name) return;
        addToken(groupId, name);
        setNewTokenNames((prev) => ({ ...prev, [groupId]: "" }));
    };

    const handleCopy = async (type: "tailwind" | "android") => {
        const text =
            type === "tailwind"
                ? exportTailwind(groups, palettes)
                : exportAndroidXml(groups, palettes);
        await writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="New group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                    className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                    onClick={handleAddGroup}
                    className="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
                >
                    Add group
                </button>
            </div>

            {groups.map((group) => (
                <div
                    key={group.id}
                    className="flex flex-col gap-3 rounded border border-gray-100 p-3"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            {group.name}
                        </p>
                        <button
                            onClick={() => removeGroup(group.id)}
                            className="text-xs text-gray-300 hover:text-red-400"
                        >
                            Remove group
                        </button>
                    </div>

                    {group.tokens.map((token) => {
                        const assignedPalette = palettes.find(
                            (p) => p.id === token.value.paletteId,
                        );
                        const assignedColour = assignedPalette?.colours.find(
                            (c) => c.id === token.value.colourId,
                        );

                        return (
                            <div
                                key={token.id}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="h-6 w-6 shrink-0 rounded border border-gray-200"
                                    style={{
                                        backgroundColor:
                                            assignedColour?.hex ?? "#f3f4f6",
                                    }}
                                />
                                <span className="w-36 truncate font-mono text-xs text-gray-700">
                                    {token.name}
                                </span>
                                <select
                                    className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    value={token.value.colourId}
                                    onChange={(e) => {
                                        const [paletteId, colourId] =
                                            e.target.value.split("::");
                                        assignColour(
                                            group.id,
                                            token.id,
                                            paletteId,
                                            colourId,
                                        );
                                    }}
                                >
                                    <option value="">— unassigned —</option>
                                    {palettes.map((p) => (
                                        <optgroup key={p.id} label={p.name}>
                                            {p.colours.map((c) => (
                                                <option
                                                    key={c.id}
                                                    value={`${p.id}::${c.id}`}
                                                >
                                                    {c.name || c.hex}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <button
                                    onClick={() =>
                                        removeToken(group.id, token.id)
                                    }
                                    className="text-gray-300 hover:text-red-400"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Token name e.g. color-primary"
                            value={newTokenNames[group.id] ?? ""}
                            onChange={(e) =>
                                setNewTokenNames((prev) => ({
                                    ...prev,
                                    [group.id]: e.target.value,
                                }))
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleAddToken(group.id)
                            }
                            className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <button
                            onClick={() => handleAddToken(group.id)}
                            className="rounded border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
                        >
                            Add token
                        </button>
                    </div>
                </div>
            ))}

            {groups.length > 0 && (
                <div className="flex gap-2 border-t border-gray-100 pt-4">
                    <button
                        onClick={() => handleCopy("tailwind")}
                        className="flex-1 rounded border border-gray-200 px-3 py-2 text-xs hover:bg-gray-50"
                    >
                        {copied === "tailwind"
                            ? "Copied!"
                            : "Copy Tailwind config"}
                    </button>
                    <button
                        onClick={() => handleCopy("android")}
                        className="flex-1 rounded border border-gray-200 px-3 py-2 text-xs hover:bg-gray-50"
                    >
                        {copied === "android" ? "Copied!" : "Copy Android XML"}
                    </button>
                </div>
            )}
        </div>
    );
}
