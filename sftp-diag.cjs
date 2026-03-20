const Client = require('ssh2-sftp-client');
const sftp = new Client();

async function main() {
  try {
    await sftp.connect({
      host: 'claesen-verlichting.be',
      port: 2222,
      username: 'v1_claesen_be',
      password: 'I^z^#18A!b17P^@m_Tz*s$Vb#mP#'
    });
    console.log("✅ Connected to SFTP securely");
    
    // Check standard /v1/ upload behavior
    const v1Path = await sftp.cwd();
    console.log("📁 Current User Directory:", v1Path);
    
    console.log("⬆️ Uploading test file to current directory...");
    await sftp.put(Buffer.from('test-sftp-permissions-1'), 'test-sftp.txt');
    
    // Log permissions
    const list = await sftp.list(v1Path);
    console.log("\n📄 Partial file list in", v1Path, ":");
    const testFile = list.find(f => f.name === 'test-sftp.txt');
    const heroBg = list.find(f => f.name === 'hero-bg.jpg');
    
    if (testFile) console.log(`   ${testFile.name}  --> Rights: ${testFile.rights.user}${testFile.rights.group}${testFile.rights.other} Owner: ${testFile.owner}`);
    if (heroBg) console.log(`   ${heroBg.name}    --> Rights: ${heroBg.rights.user}${heroBg.rights.group}${heroBg.rights.other} Owner: ${heroBg.owner}`);
    
    console.log("\n🔧 Attempting chmod to 644 on test file...");
    try {
        await sftp.chmod('test-sftp.txt', 0o644);
        console.log("   ✅ chmod SUCCESS!");
        const list2 = await sftp.list(v1Path);
        const testFile2 = list2.find(f => f.name === 'test-sftp.txt');
        console.log(`   New permissions: ${testFile2.rights.user}${testFile2.rights.group}${testFile2.rights.other}`);
    } catch(e) {
        console.log("   ❌ chmod FAILED: " + e.message);
    }
    
    console.log("\n🌍 Checking access outside of /v1/...");
    try {
        const rootList = await sftp.list('/');
        console.log("   ✅ Can view true root directory!");
        const rootFile = rootList.find(f => f.name === 'v1');
        console.log("   Found in true root:", rootFile ? "Yes" : "No");
    } catch(e) {
        console.log("   ❌ Cannot view true root directory: " + e.message);
    }
    
  } catch (err) {
    console.error("Critical error:", err.message);
  } finally {
    await sftp.end();
  }
}
main();
