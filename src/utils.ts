export function disabler(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
}

export function disableSelect(el) {
    if (el.addEventListener) {
        el.addEventListener("mousedown", disabler, "false");
    } else {
        el.attachEvent("onselectstart", disabler);
    }
}

export function enableSelect(el) {
    if (el.addEventListener) {
        el.removeEventListener("mousedown", disabler, "false");
    } else {
        el.detachEvent("onselectstart", disabler);
    }
}

export function isCollision(geo0, geo1) {
    const { x: x0, y: y0, width: w0, height: h0 } = geo0;
    const { x: x1, y: y1, width: w1, height: h1 } = geo1;
    return x1 + w1 > x0 && x0 + w0 > x1 && y1 + h1 > y0 && y0 + h0 > y1;
}
