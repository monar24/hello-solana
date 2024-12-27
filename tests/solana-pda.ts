import * as anchor from "@coral-xyz/anchor";
import { Program, SystemProgram } from "@coral-xyz/anchor";
import { SolanaPda } from "../target/types/solana_pda";
import { expect } from "chai";
const { SystemProgram } = anchor.web3

describe("Bank Test", () => {

    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.SolanaPda as Program<SolanaPda>;

    //Accounts
    const programProvider = program.provider; // USER

    const [bankPDA, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("bankaccount"), programProvider.publicKey.toBuffer()],
        program.programId
    )

    const name = "Test Account";


    it("Created Bank!", async () => {
        const txt = await program.methods.create(name).accounts(
            {
                bank: bankPDA,
                user: programProvider.publicKey,
                systemProgram: SystemProgram.programId
            }
        ).rpc();


        const bankAccount = await program.account.bank.fetch(bankPDA);
        expect(bankAccount.name).to.eql(name);
        expect(bankAccount.balance.toNumber()).to.eql(0);
        expect(bankAccount.owner).to.eql(programProvider.publicKey);
    });

      it("Deposit", async () => {

      const amount = new anchor.BN(5000);
      await airdrop(program.provider.connection, programProvider.publicKey, amount);


      const despositTx = await program.methods.deposit(amount).accounts({
        bank: bankPDA,
        user: programProvider.publicKey,
        systemProgram: SystemProgram.programId,
      }).rpc();


      console.log("Deposit Complete! Transaction Balance:", despositTx);

      const bankAccount = await program.account.bank.fetch(bankPDA);
      expect(bankAccount.balance.toNumber()).to.eql(amount.toNumber());

      });

      it("Withdraw", async () => {
        const amount = new anchor.BN(1000);

        let bankAccount = await program.account.bank.fetch(bankPDA);
        const prevBalance = bankAccount.balance.toNumber();
        const expectedBalance = prevBalance - amount.toNumber();

        const withdrawTx = await program.methods.withdraw(amount).accounts({
            bank: bankPDA,
            user: programProvider.publicKey,
            systemProgram: SystemProgram.programId,
          }).rpc();

          console.log("Withdraw Complete! Transaction Balance:", withdrawTx);

          bankAccount = await program.account.bank.fetch(bankPDA);
          expect(bankAccount.balance.toNumber()).to.eql(expectedBalance);

      });


});


export async function airdrop(
    connection: any,
    address: any,
    amount: anchor.BN
  ) {
    await connection.confirmTransaction(
      await connection.requestAirdrop(address, amount.toNumber()),
      'confirmed'
    );
  }