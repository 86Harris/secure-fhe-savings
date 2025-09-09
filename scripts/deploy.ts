import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Secure FHE Savings contract deployment...");

  // Get the contract factory
  const SecureFHESavings = await ethers.getContractFactory("SecureFHESavings");

  // Deploy the contract
  // Note: In a real deployment, you would need to provide a verifier address
  const verifierAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual verifier address
  
  console.log("📝 Deploying contract with verifier:", verifierAddress);
  
  const secureFHESavings = await SecureFHESavings.deploy(verifierAddress);

  await secureFHESavings.waitForDeployment();

  const contractAddress = await secureFHESavings.getAddress();
  
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    verifierAddress,
    deploymentTime: new Date().toISOString(),
    network: "sepolia",
    deployer: await ethers.provider.getSigner().getAddress()
  };

  console.log("📋 Deployment Information:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Update VITE_CONTRACT_ADDRESS in your .env file");
  console.log("2. Verify the contract on Etherscan");
  console.log("3. Test the contract functions");
  console.log("4. Deploy the frontend to Vercel");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
