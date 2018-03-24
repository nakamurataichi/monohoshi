class App {
  constructor() {
    this.socket = new WebSocket(config.wsServer);
    this.voltElement = document.getElementById("volt");
    this.valueElement = document.getElementById("value");

    this.i2cAccess = null;
    this.adc = null;
    this.testResult = null;
    this.results = [];
    this.measure = null;

    this.socket.onmessage = message => {
      const data = JSON.parse(message.data);
      if (data.type === "data") {
        this.voltElement.textContent = `VIN+ : ${data.volt} V`;
        this.valueElement.textContent = data.value;
      }
      if (data.type === "status" && data.onoff !== "COMMAND") {
        status.setStatus(data.onoff);
      }
    };
  }

  async test() {
    const testResults = [];
    while (true) {
      const adcData = await this.adc.read().catch(err => { throw err; });
      testResults.push(adcData.value);

      this.voltElement.textContent = `VIN+ : ${adcData.volt} V`;
      this.valueElement.textContent = adcData.value;

      // データが 50 になったら、テストを終了するために処理ループを削除
      if (testResults.length === 50) {
        break;
      }
      await common.sleep(config.waiting);
    };

    // 中央値を整数にして返す
    return Math.floor(common.median(testResults));
  }

  async run() {
    this.i2cAccess = await navigator.requestI2CAccess();
    const adcPort = this.i2cAccess.ports.get(1);

    this.adc = new MCP3425(adcPort, 0x68);
    await this.adc.init();

    /*
    // 最初のデータを取るまで3秒待つ
    await common.sleep(3000);
    this.testResult = await this.test();

    while (true) {
      const adcData = await this.adc.read().catch(err => { throw err; });
      adcData.type = "data";
      this.socket.send(JSON.stringify(adcData));

      this.voltElement.textContent = `VIN+ : ${adcData.volt} V`;
      this.valueElement.textContent = adcData.value;

      await common.sleep(config.waiting);
    };
    */
  }

  sendStatus(onoff) {
    this.socket.send(JSON.stringify({
      type: "status",
      onoff: onoff
    }));
  }

  async start() {
    this.measure = true;
    // 最初のデータを取るまで3秒待つ
    await common.sleep(3000);
    this.testResult = 500 + await this.test();

    while (this.measure) {
      const adcData = await this.adc.read().catch(err => { throw err; });
      adcData.type = "data";
      this.socket.send(JSON.stringify(adcData));

      this.results.push(adcData.value);
      if (this.results.length === 21) {
        this.results.shift();
      }

      this.voltElement.textContent = `VIN+ : ${adcData.volt} V`;
      this.valueElement.textContent = adcData.value;

      if (this.testResult < common.median(this.results)) {
        this.sendStatus("ON");
        return;
      }

      await common.sleep(config.waiting);
    };
  }

  stop() {
    this.measure = false;
    this.sendStatus("OFF");
  }
}
