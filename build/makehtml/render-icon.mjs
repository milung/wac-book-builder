export function renderIcon(icon) {
    if (!icon) return '';
    if (icon.startsWith('@') || icon.startsWith('$')) {
        icon = icon.substring(1);
        return `<awesome-icon slot="icon">${icon}</awesome-icon>`;
    } else {
        icon = icon?.replaceAll('-', '_');
        return `<md-icon slot="icon">${icon}</md-icon>`;
    };
}

