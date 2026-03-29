import { useState } from "react";
import { useTokenStore } from "../../store/tokenStore";
import { usePaletteStore } from "../../store/paletteStore";

export function TokenPanel() {
    const [newGroupName, setNewGroupName] = useState("");
    const [newTokenNames, setNewTokenNames] = useState<Record<string, string>>(
        {},
    );

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

    return (
        <div className="flex flex-col h-full">
            {/* New group input */}
            <div
                className="flex gap-1.5 p-2"
                style={{ borderBottom: "0.5px solid var(--border)" }}
            >
                <input
                    placeholder="New group…"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                />
                <button
                    onClick={handleAddGroup}
                    className="shrink-0 px-3 py-1.5 text-xs rounded-lg"
                    style={{
                        background: "var(--accent)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontFamily: '"DM Sans", sans-serif',
                    }}
                >
                    +
                </button>
            </div>

            {/* Groups list */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
                {groups.length === 0 && (
                    <p
                        className="text-xs pt-8 text-center"
                        style={{ color: "var(--ink-4)" }}
                    >
                        Add a group to start mapping tokens
                    </p>
                )}

                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="flex flex-col gap-1.5 rounded-xl p-2"
                        style={{
                            background: "var(--bg-raised)",
                            border: "0.5px solid var(--border)",
                        }}
                    >
                        {/* Group header */}
                        <div className="flex items-center justify-between px-1 pt-0.5">
                            <p
                                className="text-2xs font-medium uppercase tracking-widest"
                                style={{ color: "var(--ink-4)" }}
                            >
                                {group.name}
                            </p>
                            <button
                                onClick={() => removeGroup(group.id)}
                                className="text-xs"
                                style={{
                                    color: "var(--ink-4)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Remove
                            </button>
                        </div>

                        {/* Tokens */}
                        {group.tokens.map((token) => {
                            const assignedPalette = palettes.find(
                                (p) => p.id === token.value.paletteId,
                            );
                            const assignedColour =
                                assignedPalette?.colours.find(
                                    (c) => c.id === token.value.colourId,
                                );

                            return (
                                <div
                                    key={token.id}
                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                                    style={{
                                        background: "var(--bg-sunken)",
                                        border: "0.5px solid var(--border)",
                                    }}
                                >
                                    {/* Colour preview dot */}
                                    <div
                                        className="w-5 h-5 rounded shrink-0"
                                        style={{
                                            background:
                                                assignedColour?.hex ??
                                                "var(--border)",
                                            border: "0.5px solid rgba(0,0,0,0.08)",
                                        }}
                                    />

                                    {/* Token name */}
                                    <span
                                        className="flex-1 text-xs truncate"
                                        style={{
                                            fontFamily: '"DM Mono", monospace',
                                            color: "var(--ink-2)",
                                        }}
                                    >
                                        {token.name}
                                    </span>

                                    {/* Colour picker — styled select */}
                                    <select
                                        value={
                                            token.value.colourId
                                                ? `${token.value.paletteId}::${token.value.colourId}`
                                                : ""
                                        }
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
                                        style={{
                                            fontSize: "11px",
                                            padding: "3px 6px",
                                            borderRadius: "6px",
                                            background: "var(--bg-raised)",
                                            border: "0.5px solid var(--border-strong)",
                                            color: "var(--ink-2)",
                                            fontFamily: '"DM Sans", sans-serif',
                                            maxWidth: "90px",
                                            cursor: "pointer",
                                            width: "auto",
                                        }}
                                    >
                                        <option value="">— none —</option>
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

                                    {/* Remove token */}
                                    <button
                                        onClick={() =>
                                            removeToken(group.id, token.id)
                                        }
                                        className="shrink-0"
                                        style={{
                                            color: "var(--ink-4)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "11px",
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}

                        {/* Add token input */}
                        <div className="flex gap-1.5 mt-0.5">
                            <input
                                placeholder="Token name…"
                                value={newTokenNames[group.id] ?? ""}
                                onChange={(e) =>
                                    setNewTokenNames((prev) => ({
                                        ...prev,
                                        [group.id]: e.target.value,
                                    }))
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    handleAddToken(group.id)
                                }
                                style={{ fontSize: "11px", padding: "5px 8px" }}
                            />
                            <button
                                onClick={() => handleAddToken(group.id)}
                                className="shrink-0 px-2.5 text-xs rounded-lg"
                                style={{
                                    background: "var(--accent-soft)",
                                    color: "var(--accent)",
                                    border: "0.5px solid var(--accent)",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontSize: "11px",
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
