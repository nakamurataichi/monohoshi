class App {
  constructor() {
    this.ws = new WebSocket("wss://10.0.128.210:3052/?room=test");
    this.voltElement = document.getElementById("volt");
    this.valueElement = document.getElementById("value");

    this.i2cAccess = null;
    this.adc = null;
    this.testResult = null;
    this.dataResults = [];
  }

  async first() {
    const firstData = await this.adc.read().catch(err => { throw err; });
    return firstData.value;
  }

  async test() {
    const testResults = [];
    const timer = setInterval(async () => {
      const adcData = await this.adc.read().catch(err => { throw err; });
      testResults.push(adcData.value);

      this.voltElement.textContent = `VIN+ : ${adcData.volt} V`;
      this.valueElement.textContent = adcData.value;

      // データが 100 になったら、テストを終了するために処理ループを削除
      if (testResults.length === 100) {
        clearTimeout(timer);
      }
    }, 3000);

    // 中央値を整数にして返す
    return Math.floor(common.median(testResults));
  }

  async run() {
    this.i2cAccess = await navigator.requestI2CAccess();
    const adcPort = this.i2cAccess.ports.get(1);

    this.adc = new MCP3425(adcPort, 0x68);
    await adc.init();

    // 最初のデータを取るまで3秒待つ
    await common.sleep(3000);
    this.testResult = await this.test();

    let i = 0;

    const timer = setInterval(async () => {
      const adcData = await this.adc.read().catch(err => { throw err; });
      dataResults.push(adcData.value);
      ws.send(adcData.value)

      this.voltElement.textContent = `VIN+ : ${adcData.volt} V`;
      this.valueElement.textContent = adcData.value;

      i++;

      if (i > 1000) {
        clearTimeout(timer);
        this.sendMessage();
      }
    }, 3000);
  }

  sendMessage() {
    for (var cnt = 0; cnt < 10; cnt++) {
      setTimeout(() => ws.send("fire"), cnt * 1000);
    }
    console.log("say!!");
    setTimeout(() => ws.send("stop"), 10000);
  }
}
