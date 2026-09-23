async function runApiTest() {
  console.log('--- STARTING END-TO-END API TEST ---');

  // 1. System Health
  const statusRes = await fetch('http://localhost:5000/api/system/status');
  const statusData = await statusRes.json();
  console.log('1. System Status:', JSON.stringify(statusData, null, 2));

  // 2. Record Sensor Data (Off-Chain + On-Chain Proof)
  const recordRes = await fetch('http://localhost:5000/api/sensor-data/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'ENV_SENSOR_001' })
  });
  const recordData = await recordRes.json();
  console.log('\n2. Record Sensor Data Response:', JSON.stringify(recordData, null, 2));

  const recordId = recordData.record.id;

  // 3. Initial Verification (Should be VERIFIED)
  const verify1Res = await fetch(`http://localhost:5000/api/verify/${recordId}`, { method: 'POST' });
  const verify1Data = await verify1Res.json();
  console.log(`\n3. Initial Verification for Record #${recordId}:`, JSON.stringify(verify1Data, null, 2));

  // 4. Controlled Data Tampering Demo
  const tamperRes = await fetch(`http://localhost:5000/api/tamper/${recordId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newTemperature: 38.6 })
  });
  const tamperData = await tamperRes.json();
  console.log(`\n4. Data Tampering Triggered for Record #${recordId}:`, JSON.stringify(tamperData, null, 2));

  // 5. Re-Verify (Should be TAMPER DETECTED)
  const verify2Res = await fetch(`http://localhost:5000/api/verify/${recordId}`, { method: 'POST' });
  const verify2Data = await verify2Res.json();
  console.log(`\n5. Re-Verification after Tampering for Record #${recordId}:`, JSON.stringify(verify2Data, null, 2));

  console.log('\n--- END-TO-END API TEST COMPLETE ---');
}

runApiTest().catch(console.error);
