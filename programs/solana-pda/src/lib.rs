use anchor_lang::prelude::*;

declare_id!("BpxAoexMMi9UmA11W3nhhzQM3wXrVa5HGLksEn2U3z5X");

#[program]
pub mod solana_pda {
    use super::*;
    use anchor_lang::solana_program::{program::invoke, system_instruction};

    pub fn create(ctx: Context<Create>, name: String) -> Result<()> {
        let bank = &mut ctx.accounts.bank;
        bank.name = name;
        bank.balance = 0;
        bank.owner = ctx.accounts.user.key();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let instruction = &system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.bank.key(),
            amount,
        );

        let account_infos = [
            ctx.accounts.user.to_account_info(),
            ctx.accounts.bank.to_account_info(),
        ];

        invoke(instruction, &account_infos)?;

        (&mut ctx.accounts.bank).balance += amount; //update balance
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let bank = &mut ctx.accounts.bank;
        let user = &mut ctx.accounts.user;

        // UnAuthorized User
        if bank.owner != user.key() {
            return Err(ErrorCode::Unauthorized.into());
        }

        // Check we have enough left in account for rent to make sure account won't be GC + destroyed
        let rent = Rent::get()?.minimum_balance(bank.to_account_info().data_len());
        
        transfer_lamports(&bank.to_account_info(), &user.to_account_info(), amount, rent)?;

        bank.balance -= amount;
        
        Ok(())
    }


}

pub fn transfer_lamports(
    from_account: &AccountInfo,
    to_account: &AccountInfo,
    amount_of_lamports: u64,
    rent: u64
) -> Result<()> {

    if from_account.lamports() - rent < amount_of_lamports {
        return Err(ErrorCode::InsufficientFunds.into());
    }

    // Cheaper to do direct mutation of lamports instead of system program invocation
    **from_account.try_borrow_mut_lamports()? -= amount_of_lamports;
    **to_account.try_borrow_mut_lamports()? += amount_of_lamports;   
    
    Ok(())
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(
    init,
    seeds = [b"bankaccount", user.key().as_ref()],
    bump,
    payer = user,
    space = 5000
    )]
    pub bank: Account<'info, Bank>, //pda bank account
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub bank: Account<'info, Bank>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub bank: Account<'info, Bank>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Bank {
    pub name: String,
    pub balance: u64,
    pub owner: Pubkey,
}

#[error_code]
pub enum ErrorCode {

    #[msg("Insufficient funds.")]
    InsufficientFunds,

    #[msg("Unauthorized access.")]
    Unauthorized,
}
