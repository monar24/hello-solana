use anchor_lang::prelude::*;

declare_id!("5zTm3fAwh2CXe7HHLT9aRzewm2kM453QQBSmKCaYdM6v");

// 1. Specify all supported instructions
#[program]
pub mod hello_solana {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>, _hello: String) -> Result<()> {
        msg!("Greetings from: {:?}", _ctx.program_id);

        let data_account : &mut Account <'_, DataAccount> = &mut _ctx.accounts.data_account; //mutable so we can update the account 
        data_account.hello = _hello;

        Ok(())
    }
}

//2. Specify Instruction Inputs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>, // will pay rent in data account, cannot have 0 balance in data account
    #[account(
        init, //initialize new data account
        payer = signer, //rent payer
        space = 200,
    )]
    pub data_account: Account<'info, DataAccount>,
    pub system_program: Program<'info, System>,
}

//3. Specify data accounts 
#[account]
pub struct DataAccount {
    pub hello: String, //storing string in data account
}

