<template>
    <div class="editor">
        <!-- 工具栏 -->
        <div class="toolbar">
            <!-- 工具选择 -->
            <button :class="{ active: tool === 'pen' }" @click="setTool('pen')" title="画笔">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="M6 21q-1.125 0-2.225-.55T2 19q.65 0 1.325-.513T4 17q0-1.25.875-2.125T7 14t2.125.875T10 17q0 1.65-1.175 2.825T6 21m0-2q.825 0 1.412-.587T8 17q0-.425-.288-.712T7 16t-.712.288T6 17q0 .575-.137 1.05t-.363.9q.125.05.25.05zm5.75-4L9 12.25l9.65-9.65l2.75 2.75zM7 17" />
                </svg>
            </button>
            <button :class="{ active: tool === 'line' }" @click="setTool('line')" title="直线">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="m1.39 18.36l1.77-1.76L4.58 18l1.06-1.05l-1.42-1.41l1.42-1.42l2.47 2.48l1.06-1.06l-2.47-2.48l1.41-1.41l1.42 1.41L10.59 12l-1.42-1.41l1.42-1.42l2.47 2.48l1.06-1.06l-2.47-2.48l1.41-1.41l1.41 1.41l1.07-1.06l-1.42-1.41l1.42-1.42L18 6.7l1.07-1.06l-2.47-2.48l1.76-1.77l4.25 4.25L5.64 22.61z" />
                </svg>
            </button>
            <button :class="{ active: tool === 'rect' }" @click="setTool('rect')" title="矩形">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000" d="M2 20V4h20v16zm2-2h16V6H4zm0 0V6z" />
                </svg>
            </button>
            <button :class="{ active: tool === 'circle' }" @click="setTool('circle')" title="圆形">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8" />
                </svg>
            </button>
            <button :class="{ active: tool === 'eraser' }" @click="setTool('eraser')" title="橡皮">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-1.5 -2.5 24 24">
                    <path fill="#000000"
                        d="M12.728 12.728L8.485 8.485l-5.657 5.657l2.122 2.121a3 3 0 0 0 4.242 0zM11.284 17H14a1 1 0 0 1 0 2H3a1 1 0 0 1-.133-1.991l-1.453-1.453a2 2 0 0 1 0-2.828L12.728 1.414a2 2 0 0 1 2.828 0L19.8 5.657a2 2 0 0 1 0 2.828z" />
                </svg>
            </button>
            <button :class="{ active: tool === 'move' }" @click="setTool('move')" title="移动">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="M3 16V5.75a1.25 1.25 0 0 1 2.5 0V12h1V2.75a1.25 1.25 0 0 1 2.5 0V12h1V1.25a1.25 1.25 0 0 1 2.5 0V12h1V3.25a1.25 1.25 0 0 1 2.5 0V15h.75l1.41-3.53c.22-.55.68-.97 1.24-1.16l.79-.26a1 1 0 0 1 1.24 1.32L18.4 19c-1.21 3-4.14 5-7.4 5c-4.42 0-8-3.58-8-8" />
                </svg>
            </button>

            <!-- 文件操作 -->
            <button @click="newFile" title="新建">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="M4 23q-.825 0-1.412-.587T2 21V7h2v14h11v2zm4-4q-.825 0-1.412-.587T6 17V3q0-.825.588-1.412T8 1h7l6 6v10q0 .825-.587 1.413T19 19zm6-11h5l-5-5z" />
                </svg>
            </button>
            <button @click="undo" title="撤销">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="M7 19v-2h7.1q1.575 0 2.738-1T18 13.5T16.838 11T14.1 10H7.8l2.6 2.6L9 14L4 9l5-5l1.4 1.4L7.8 8h6.3q2.425 0 4.163 1.575T20 13.5t-1.737 3.925T14.1 19z" />
                </svg>
            </button>
            <button @click="redo" title="重做">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="M9.9 19q-2.425 0-4.163-1.575T4 13.5t1.738-3.925T9.9 8h6.3l-2.6-2.6L15 4l5 5l-5 5l-1.4-1.4l2.6-2.6H9.9q-1.575 0-2.738 1T6 13.5T7.163 16T9.9 17H17v2z" />
                </svg>
            </button>
            <button @click="exportSVG" title="导出">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#000000"
                        d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z" />
                </svg>
            </button>
            <button @click="clearCanvas" title="清空">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                    <path fill="#000000"
                        d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1l-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                </svg>
            </button>
            <button class="btn" title="上传文件"><input type="file" accept=".svg" @change="importSVG"
                    style="width: 100%;height: 100%;opacity: 0;" />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                    style="position: absolute;top: 4px;left: 12px;">
                    <path fill="#000000"
                        d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16zm-5 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z" />
                </svg>
            </button>

            <!-- 样式 -->
            <label>
                🎨 颜色
                <input type="color" v-model="strokeColor">
            </label>
            <label>
                ✂️ 线宽
                <input type="number" v-model="strokeWidth" min="1" max="10" />
            </label>

            <label>🖌️ 宽 <input type="number" v-model.number="canvasWidth" /></label>
            <label>🖌️ 高 <input type="number" v-model.number="canvasHeight" /></label>
        </div>

        <!-- 画布 -->
        <svg ref="svgCanvas" class="canvas" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp"
            :width="canvasWidth" :height="canvasHeight">
            <g ref="globalGroup" :transform="`translate(${globalOffset.x},${globalOffset.y})`"></g>
        </svg>

        <input v-if="editingText" ref="textInput" class="wenben" v-model="textValue" :style="textInputStyle"
            @mousedown.stop @keydown.enter.prevent="finishTextEdit" />
    </div>
</template>

<script setup>
import { ref, reactive, nextTick } from "vue";

const svgCanvas = ref(null);
const globalGroup = ref(null);

const tool = ref("pen");
const strokeColor = ref("#000000");
const strokeWidth = ref(2);
const canvasWidth = ref(900);
const canvasHeight = ref(600);

let drawing = false;
let currentElement = null;
let isErasing = false;

const globalOffset = reactive({ x: 0, y: 0 });
let moveStart = null;

// 操作历史
const history = reactive({
    stack: [],
    index: -1
});

// ===== 撤销 / 重做 =====
function saveHistory() {
    if (!svgCanvas.value) return;
  const current = svgCanvas.value.innerHTML;

  // 截断 redo
  if (history.index < history.stack.length - 1) {
    history.stack.splice(history.index + 1);
  }

  history.stack.push(current);
  history.index++;
}

function undo() {
    if (history.index > 0) {
        history.index--;
        svgCanvas.value.innerHTML = history.stack[history.index];
        rebindAllLayers();
    }
}

function redo() {
    if (history.index < history.stack.length - 1) {
        history.index++;
        svgCanvas.value.innerHTML = history.stack[history.index];
        rebindAllLayers();
    }
}

const svgLayers = reactive([]);

function setTool(t) {
    tool.value = t;
}

// ===== 文件操作 =====
function newFile() {
    svgCanvas.value.innerHTML = "";
    history.stack = [svgCanvas.value.innerHTML];
    history.index = 0;
    svgLayers.splice(0);
}

function clearCanvas() {
    if (!svgCanvas.value) return;
    svgCanvas.value.innerHTML = "";
    saveHistory();
    svgLayers.splice(0);
}

function exportSVG() {
    const svg = svgCanvas.value;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    // 确保根节点包含所有常见命名空间
    const nsAttrs = [
        'xmlns="http://www.w3.org/2000/svg"',
        'xmlns:xlink="http://www.w3.org/1999/xlink"',
        'xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"',
        'xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"',
        'xmlns:dc="http://purl.org/dc/elements/1.1/"',
        'xmlns:cc="http://creativecommons.org/ns#"',
        'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"'
    ];

    if (!source.includes("xmlns=")) {
        // 如果缺失 xmlns，就直接把全部命名空间补充进去
        source = source.replace("<svg", "<svg " + nsAttrs.join(" "));
    } else {
        // 如果已有 xmlns，但缺少其他命名空间，就逐个补充
        nsAttrs.forEach(ns => {
            const key = ns.split("=")[0]; // 比如 xmlns:inkscape
            if (!source.includes(key)) {
                source = source.replace("<svg", "<svg " + ns);
            }
        });
    }

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drawing.svg";
    a.click();
    URL.revokeObjectURL(url);
}


function importSVG(e) {
    console.log(1)
    const files = Array.from(e.target.files || []);
    if (!svgCanvas.value) return;
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = evt => {
            const text = evt.target.result;
            // Parse svg string into DOM
            const wrapper = document.createElement("div");
            wrapper.innerHTML = text.replace(/^<\?xml.*?\?>/, "").replace(/<!DOCTYPE.*?>/, "");
            const importedSVG = wrapper.querySelector("svg");
            if (!importedSVG) return;

            // Create a <g> container for the imported content so we can transform it easily
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

            // Initialize transform metadata on the group for consistent behavior
            g.dataset.tx = "0";
            g.dataset.ty = "0";
            g.dataset.rotate = "0";

            // Move all children from importedSVG into g
            while (importedSVG.firstChild) {
                g.appendChild(importedSVG.firstChild);
            }

            // Optionally scale imported content if its viewBox differs (not handled here — keep native sizes)
            // Place g roughly at center-ish (or at 0,0)
            svgCanvas.value.appendChild(g);

            // Bind drag/rotate interactions
            bindDragRotate(g);

            svgLayers.push(g);
            saveHistory();
        };
        reader.readAsText(file);
    });

    // reset input so same file(s) can be reselected later
    e.target.value = "";
}

function rebindAllLayers() {
    svgLayers.splice(0); // 清除
    // find all top-level <g> nodes that were used as imported layers and rebind
    const groups = svgCanvas.value.querySelectorAll("g");
    groups.forEach(g => {
        // set default dataset if missing
        if (!g.dataset.tx) { g.dataset.tx = "0"; g.dataset.ty = "0"; g.dataset.rotate = "0"; }
        bindDragRotate(g);
        svgLayers.push(g);
    });
}

// ===== 绘制 =====
function onMouseDown(e) {
    if (tool.value === "move") {
        moveStart = { x: pt.x, y: pt.y };
        return;
    }

    if (!svgCanvas.value) return;
    drawing = true;
    const svg = svgCanvas.value;
    const pt = getMousePosition(e);

    if (tool.value === "eraser") {
        isErasing = true;
        eraseElement(e);
        return; // 橡皮不用进入绘制流程
    }

    if (tool.value === "pen") {
        currentElement = createElement("path", {
            d: `M${pt.x},${pt.y}`,
            stroke: strokeColor.value,
            "stroke-width": strokeWidth.value,
            fill: "none"
        });
        svg.appendChild(currentElement);
    } else if (tool.value === "rect") {
        currentElement = createElement("rect", {
            x: pt.x,
            y: pt.y,
            width: 0,
            height: 0,
            stroke: strokeColor.value,
            "stroke-width": strokeWidth.value,
            fill: "transparent",
            x0: pt.x,
            y0: pt.y,
        });
        svg.appendChild(currentElement);
    } else if (tool.value === "circle") {
        currentElement = createElement("circle", {
            cx: pt.x,
            cy: pt.y,
            r: 0,
            stroke: strokeColor.value,
            "stroke-width": strokeWidth.value,
            fill: "transparent"
        });
        svg.appendChild(currentElement);
    } else if (tool.value === "eraser") {
        const target = e.target;
        if (target.tagName !== "svg") target.remove();
        drawing = false;
        saveHistory();
    } else if (tool.value === "line") {
        currentElement = createElement("line", {
            x1: pt.x,
            y1: pt.y,
            x2: pt.x,
            y2: pt.y,
            stroke: strokeColor.value,
            "stroke-width": strokeWidth.value
        });
        svgCanvas.value.appendChild(currentElement);
    }
}

function onMouseMove(e) {
    if (tool.value === "move" && moveStart) {
        const dx = pt.x - moveStart.x;
        const dy = pt.y - moveStart.y;
        globalOffset.x += dx;
        globalOffset.y += dy;
        moveStart = pt; // 更新起点
        return;
    }

    if (!drawing || !currentElement) return;
    const pt = getMousePosition(e);

    if (tool.value === "eraser" && isErasing) {
        eraseElement(e);
        return;
    }

    if (!currentElement) return;

    if (tool.value === "pen") {
        let d = currentElement.getAttribute("d");
        d += ` L${pt.x},${pt.y}`;
        currentElement.setAttribute("d", d);
    } else if (tool.value === "rect") {
        const startX = parseFloat(currentElement.getAttribute("x0"));
        const startY = parseFloat(currentElement.getAttribute("y0"));
        const width = pt.x - startX;
        const height = pt.y - startY;

        // 确保矩形向左或向上拖动时正确显示
        currentElement.setAttribute("x", width >= 0 ? startX : pt.x);
        currentElement.setAttribute("y", height >= 0 ? startY : pt.y);
        currentElement.setAttribute("width", Math.abs(width));
        currentElement.setAttribute("height", Math.abs(height));
    } else if (tool.value === "circle") {
        const cx = parseFloat(currentElement.getAttribute("cx"));
        const cy = parseFloat(currentElement.getAttribute("cy"));
        const r = Math.sqrt(Math.pow(pt.x - cx, 2) + Math.pow(pt.y - cy, 2));
        currentElement.setAttribute("r", r);
    } else if (tool.value === "line") {
        currentElement.setAttribute("x2", pt.x);
        currentElement.setAttribute("y2", pt.y);
    }
}

function onMouseUp() {
    if (!svgCanvas.value) return;

    if (tool.value === "move") {
        moveStart = null;
        return;
    }

    if (drawing) {
        saveHistory();
    }
    drawing = false;
    currentElement = null;
    isErasing = false;
}

function eraseElement(e) {
    const target = e.target;
    if (target.tagName !== "svg") {
        target.remove();
        saveHistory();
    }
}

// ===== 辅助函数 =====
function getMousePosition(evt) {
    const CTM = svgCanvas.value.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function createElement(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (let [key, val] of Object.entries(attrs)) {
        el.setAttribute(key, val);
    }
    return el;
}

function bindDragRotate(g) {
    if (!g) return;

    g.style.pointerEvents = "all";

    let dragging = false;
    let rotating = false;
    let start = null;
    let center = null;
    let orig = { tx: 0, ty: 0, rot: 0 };

    // read dataset numeric helpers
    const readDataset = () => ({
        tx: parseFloat(g.dataset.tx || "0"),
        ty: parseFloat(g.dataset.ty || "0"),
        rot: parseFloat(g.dataset.rotate || "0")
    });

    function applyTransform(tx, ty, rot) {
        const bbox = g.getBBox();
        // rotation center use group's bbox center in local coords (0..)
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        g.setAttribute("transform", `translate(${tx},${ty}) rotate(${rot} ${cx} ${cy})`);
        g.dataset.tx = String(tx);
        g.dataset.ty = String(ty);
        g.dataset.rotate = String(rot);
    }

    function pointerDownHandler(evt) {
        // Only respond to primary button
        if (evt.button !== 0) return;
        evt.stopPropagation();
        const pt = getMousePosition(evt);
        start = { x: pt.x, y: pt.y };

        const bbox = g.getBBox();
        center = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };

        const ds = readDataset();
        orig = { tx: ds.tx, ty: ds.ty, rot: ds.rot };

        dragging = true;
        rotating = evt.altKey === true;
        // capture pointer on the svg so move/up captured
        svgCanvas.value.setPointerCapture(evt.pointerId);
    }

    function pointerMoveHandler(evt) {
        if (!dragging) return;
        const pt = getMousePosition(evt);
        const dx = pt.x - start.x;
        const dy = pt.y - start.y;

        if (rotating) {
            // compute angle from center to start vs center to current
            const v1x = start.x - center.x;
            const v1y = start.y - center.y;
            const v2x = pt.x - center.x;
            const v2y = pt.y - center.y;
            const ang1 = Math.atan2(v1y, v1x);
            const ang2 = Math.atan2(v2y, v2x);
            const dAng = (ang2 - ang1) * (180 / Math.PI); // degrees
            const newRot = orig.rot + dAng;
            applyTransform(orig.tx, orig.ty, newRot);
        } else {
            const newTx = orig.tx + dx;
            const newTy = orig.ty + dy;
            applyTransform(newTx, newTy, orig.rot);
        }
    }

    function pointerUpHandler(evt) {
        if (!dragging) return;
        dragging = false;
        rotating = false;
        try { svgCanvas.value.releasePointerCapture(evt.pointerId); } catch (e) { }
        saveHistory();
    }

    // Attach handlers to group (pointerdown) and to svg (pointermove/pointerup)
    g.addEventListener("pointerdown", pointerDownHandler);
    // pointermove and pointerup must be on svg so moves are tracked even if pointer leaves the group
    svgCanvas.value.addEventListener("pointermove", pointerMoveHandler);
    svgCanvas.value.addEventListener("pointerup", pointerUpHandler);

    // store handlers so they could be removed later if needed (not used here)
    g.__dragHandlers = { pointerDownHandler, pointerMoveHandler, pointerUpHandler };
}
</script>

<style scoped>
.editor {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.toolbar {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px;
    border-right: 1px solid #ccc;
    width: 60px;
    box-sizing: border-box;
    align-items: center;
    font-size: 12px;
}

.toolbar button {
    width: 100%;
    font-size: 12px;
    padding: 4px 0;
}

.toolbar label {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    font-size: 10px;
    width: 100%;
}

.toolbar label input,
.toolbar label select {
    width: 100%;
    margin-top: 2px;
    box-sizing: border-box;
}

.toolbar button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.canvas {
    border: 1px solid #aaa;
    background: transparent;
    cursor: crosshair;
}

.btn {
    width: 100%;
    font-size: 12px;
    padding: 4px 0;
    position: relative;
    height: 32px;
}
</style>
