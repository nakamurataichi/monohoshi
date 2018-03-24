class Status {
  constructor() {
    this.onoff = "OFF";
    this.mode = "";
    this.labelElement = document.getElementById("status-label");
    this.imageElement = document.getElementById("status-image");
    this.buttonElement = document.getElementById("status-button");

    this.buttonElement.onclick = this.toggleStatus;
    this.labelElement.textContent = `${this.onoff} です`;
    this.imageElement.src = `./${this.onoff}.png`;
  }

  toggleStatus() {
    status.onoff = status.onoff === "OFF" ? "ON" : "OFF";
    if (status.onoff === "ON") {
      status.mode = "Start";
      app.start();
    } else {
      status.mode = "Stop";
      app.stop();
    }
    status.updateStatus();
    //app.sendStatus(status.onoff);
  }

  updateStatus() {
    status.labelElement.textContent = `${this.mode} です`;
    status.imageElement.src = `./${this.onoff}.png`;
  }

  setStatus(status) {
    this.onoff = status;
    this.updateStatus();
  }
}
