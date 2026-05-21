const canvas = document.querySelector("#posterCanvas");
const ctx = canvas.getContext("2d");

const state = {
  cover: null,
  title: " ",
  artist: " ",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  radius: 38,
};

const layout = {
  width: 1644,
  height: 580,
  coverX: 70,
  coverY: 68,
  coverSize: 444,
  textX: 515,
  textWidth: 1080,
  titleY: 252,
  artistY: 420,
};

const controls = {
  coverInput: document.querySelector("#coverInput"),
  titleInput: document.querySelector("#titleInput"),
  artistInput: document.querySelector("#artistInput"),
  zoomInput: document.querySelector("#zoomInput"),
  xInput: document.querySelector("#xInput"),
  yInput: document.querySelector("#yInput"),
  radiusInput: document.querySelector("#radiusInput"),
  downloadButton: document.querySelector("#downloadButton"),
};

function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function fontStack() {
  return `Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

function fitFontSize(text, weight, maxSize, minSize, maxWidth) {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${fontStack()}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

function drawCover() {
  const { coverX, coverY, coverSize } = layout;
  roundedRectPath(ctx, coverX, coverY, coverSize, coverSize, state.radius);
  ctx.save();
  ctx.clip();

  if (!state.cover) {
    ctx.fillStyle = "#f0eee9";
    ctx.fillRect(coverX, coverY, coverSize, coverSize);
    ctx.fillStyle = "#b8b0a3";
    ctx.font = `800 42px ${fontStack()}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ALBUM", coverX + coverSize / 2, coverY + coverSize / 2);
    ctx.restore();
    return;
  }

  const image = state.cover;
  const baseScale = Math.max(coverSize / image.width, coverSize / image.height);
  const scale = baseScale * state.zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const maxShiftX = Math.max(0, (drawWidth - coverSize) / 2);
  const maxShiftY = Math.max(0, (drawHeight - coverSize) / 2);
  const drawX = coverX + (coverSize - drawWidth) / 2 + state.offsetX * maxShiftX;
  const drawY = coverY + (coverSize - drawHeight) / 2 + state.offsetY * maxShiftY;

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function drawText() {
  const centerX = layout.textX + layout.textWidth / 2;
  const maxTextWidth = layout.textWidth - 70;
  const titleSize = fitFontSize(state.title, 850, 132, 56, maxTextWidth);
  const artistSize = fitFontSize(state.artist, 250, 94, 42, maxTextWidth);

  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `850 ${titleSize}px ${fontStack()}`;
  ctx.fillText(state.title, centerX, layout.titleY);

  ctx.font = `250 ${artistSize}px ${fontStack()}`;
  ctx.fillText(state.artist, centerX, layout.artistY);
}

function render() {
  ctx.clearRect(0, 0, layout.width, layout.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, layout.width, layout.height);
  drawCover();
  drawText();
}

function resetCropControls() {
  state.zoom = 1;
  state.offsetX = 0;
  state.offsetY = 0;
  controls.zoomInput.value = "1";
  controls.xInput.value = "0";
  controls.yInput.value = "0";
}

function loadCover(file) {
  if (!file) return;
  const image = new Image();
  const source = URL.createObjectURL(file);

  image.onload = () => {
    state.cover = image;
    resetCropControls();
    render();
    URL.revokeObjectURL(source);
  };

  image.onerror = () => {
    URL.revokeObjectURL(source);
  };

  image.src = source;
}

controls.coverInput.addEventListener("change", (event) => {
  loadCover(event.target.files[0]);
});

controls.titleInput.addEventListener("input", (event) => {
  state.title = event.target.value || " ";
  render();
});

controls.artistInput.addEventListener("input", (event) => {
  state.artist = event.target.value || " ";
  render();
});

controls.zoomInput.addEventListener("input", (event) => {
  state.zoom = Number(event.target.value);
  render();
});

controls.xInput.addEventListener("input", (event) => {
  state.offsetX = Number(event.target.value);
  render();
});

controls.yInput.addEventListener("input", (event) => {
  state.offsetY = Number(event.target.value);
  render();
});

controls.radiusInput.addEventListener("input", (event) => {
  state.radius = Number(event.target.value);
  render();
});

controls.downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");
  const safeTitle = state.title.trim().replace(/[\\/:*?"<>|]+/g, "-") || "music-player";
  link.download = `${safeTitle}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

render();
