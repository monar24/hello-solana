import * as anchor from "@coral-xyz/anchor";
import { Program, SystemProgram } from "@coral-xyz/anchor";
import { Calculator } from "../target/types/calculator";
import { expect } from "chai";
const { SystemProgram } = anchor.web3

describe("calculator", () => {

  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Calculator as Program<Calculator>;

  //Accounts
  const programProvider = program.provider; // USER
  const calculatorPair = anchor.web3.Keypair.generate();

  const text = "Texas Instrument Calculator";


  it("Created Calculator!", async () => {

    const tx = await program.methods.create(text).accounts(
      {
        calculator: calculatorPair.publicKey,
        user: programProvider.publicKey,
        systemProgram: SystemProgram.programId,
      }
    ).signers([calculatorPair]).rpc();
    console.log("Calculator Created! Your transaction signature\n", tx);

    const account = await program.account.calculator.fetch(calculatorPair.publicKey);
    expect(account.greeting).to.eql(text)

  });


  it("Addition!", async () => {

    const num1 = new anchor.BN(2);
    const num2 = new anchor.BN(3);
    const result = new anchor.BN(5);

    const tx = await program.methods.add(num1, num2).accounts({
      calculator: calculatorPair.publicKey
    }).rpc();

    console.log("Addition Tx: \n", tx);

    const account = await program.account.calculator.fetch(calculatorPair.publicKey);
    expect(account.result).to.eql(result);

  });

  it("Subtraction!", async () => {

    const num1 = new anchor.BN(5);
    const num2 = new anchor.BN(3);
    const result = new anchor.BN(2);

    const tx = await program.methods.sub(num1, num2).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();

    console.log("Subtraction Tx: \n", tx);

    const account = await program.account.calculator.fetch(calculatorPair.publicKey);
    expect(account.result).to.eql(result);
  });


  it("Mixed Operations!", async () => {

    const num1 = new anchor.BN(2);
    const num2 = new anchor.BN(3);

    const result = new anchor.BN(5);

    await program.methods.add(num1, num2).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();

    let currentVal = await program.account.calculator.fetch(calculatorPair.publicKey);

    await program.methods.sub(currentVal.result, num2).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();

    currentVal = await program.account.calculator.fetch(calculatorPair.publicKey);

   await program.methods.add(currentVal.result, num2).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();


    const account = await program.account.calculator.fetch(calculatorPair.publicKey);
    expect(account.result).to.eql(result);
  });






});
