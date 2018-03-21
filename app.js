class App {
  constructor() {
    this.ws = new WebSocket(config.wsServer);
    this.voltElement = document.getElementById("volt");
    this.valueElement = document.getElementById("value");

    this.i2cAccess = null;
    this.adc = null;
    this.testResult = null;

    this.ws.onmessage = message => {
      const socketData = [];
      for (const key in message.data) {
        socketData.push(message.data[key]);
      }
      const data = socketData.join("").split(",");

      this.voltElement.textContent = `VIN+ : ${data[0]} V`;
      this.valueElement.textContent = data[1];
    };
  }

  async test() {
    const testResults = [];
    while (true) {
      const adcData = await this.adc.read().catch(err => { throw err; });
      testResults.push(adcData.value);

      this.voltElement.textContent = `VIN+ : ${adcData.volt} V`;
      this.valueElement.textContent = adcData.value;

      // データが 20 になったら、テストを終了するために処理ループを削除
      if (testResults.length === 20) {
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

    // 最初のデータを取るまで3秒待つ
    await common.sleep(3000);
    this.testResult = await this.test();

    while (true) {
      const adcData = await this.adc.read().catch(err => { throw err; });
      this.ws.send(Object.values(adcData));

      this.voltElement.textContent = `VIN+ : ${adcData.volt} V`;
      this.valueElement.textContent = adcData.value;

      await common.sleep(config.waiting);
    };
  }
}
