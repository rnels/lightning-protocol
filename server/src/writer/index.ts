// This is where the logic for the automated writing of contracts will go

// Goals:
/**
 * 1. Determine fair pricing for contracts
 * 2. Allocate pool assets to contracts in a way that assures fair risk / reward to pool participants and options traders
 * 3.
*/

// Some considerations:
/**
 * Contracts can only be created using currently unlocked pool amounts.
 *
 * If it's expected to try and achieve 100% pool utilization, the pool locks should have a "cooldown" to avoid users being constantly locked out of withdrawal from their pool.
 *
 * The pricing of the options should follow the Black-Scholes model unless I want to go with another model that is tailored more towards American-style options. Also, Black-Scholes does not factor transaction costs in buying the option. Technically there is only a selling cost, but that cost could be factored in.
 * Other options: Binomial, Trinomial, Bjerksund-Stensland
 *
 * All options contracts are created a fixed time away from the date they are issued, let's say 2 months for now. Every week, another set of them is written.
 *
*/