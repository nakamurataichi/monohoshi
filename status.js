class Status {
  constructor() {
    this.onoff = "OFF";
    this.labelElement = document.getElementById("status-label");
    this.imageElement = document.getElementById("status-image");
    this.buttonElement = document.getElementById("status-button");

    this.buttonElement.onclick = this.toggleStatus;
    this.labelElement.textContent = `${this.onoff} です`;
    this.imageElement.src = `./${this.onoff}.png`;
  }

  toggleStatus() {
    status.onoff = status.onoff === "OFF" ? "ON" : "OFF";
    status.updateStatus();
    app.sendStatus(status.onoff);
  }

  updateStatus() {
    status.labelElement.textContent = `${this.onoff} です`;
    status.imageElement.src = `./${this.onoff}.png`;
  }

  setStatus(status) {
    this.onoff = status;
    this.updateStatus();
  }
}
