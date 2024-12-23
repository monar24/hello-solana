import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloSolana } from "../target/types/hello_solana";

describe("hello-solana", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.HelloSolana as Program<HelloSolana>;

  const signer = anchor.web3.Keypair.generate();
  const data_account = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    const connect = program.provider.connection;
    const airdropAmount = 100 * anchor.web3.LAMPORTS_PER_SOL

    // airdrop the monies to the signer (payer)
    await connect.confirmTransaction(await connect.requestAirdrop(signer.publicKey, airdropAmount), "confirmed")

    const tx = await program.methods.initialize("Hello Solana").accounts({
      signer: signer.publicKey,
      dataAccount: data_account.publicKey
    }).signers([signer, data_account]).rpc();

    console.log("Your transaction signature\n", tx);

    const localHostUrl= `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`;
    console.log("localHostUrl\n", localHostUrl);

    const dataAccount = await program.account.dataAccount.fetch(data_account.publicKey); //fetch data from data account
    console.log("Data Account", dataAccount);
  });
});
