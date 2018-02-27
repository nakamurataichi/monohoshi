class MCP3425 {
  constructor(i2cPort, slaveAddress) {
    this.i2cPort = i2cPort;
    this.i2cSlave = null;
    this.slaveAddress = slaveAddress;
  }

  async init() {
    this.i2cSlave = await this.i2cPort.open(this.slaveAddress).catch(err => { throw err; });

    console.log(`init ok: ${this.i2cSlave}`);
    return; 
  }

  compose(adc_h, adc_l) {
    const ad_val = this.adjust(this.merge(adc_h, adc_h));
    const volt = ad_val * 2.048 / 32767;
    return volt;
  }

  merge(adc_h, adc_l) {
    return adc_l | (adc_h << 8);
  }

  adjust(ad_val) {
    return (ad_val > 32767) ? ad_val - 65536 : ad_val;
  }

  async read() {
    if (this.i2cSlave === null) {
      throw new Error("i2cSlave Address does'nt yet open!");
    }
    await this.i2cSlave.writeByte(0x88);
    await common.sleep(100);

    const v = await this.i2cSlave.readBytes(2).catch(err => { throw err; });
    const volt = this.compose(v[0], v[1]);
    const value = this.merge(v[0], v[1]);

    return { volt, value };
  }
}
