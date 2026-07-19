describe('Currency Exchange Dashboard', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/codes', {
      statusCode: 200,
      body: {
        result: 'success',
        documentation: 'docs',
        terms_of_use: 'terms',
        supported_codes: [
          ['MYR', 'Malaysian Ringgit'],
          ['USD', 'United States Dollar'],
          ['EUR', 'Euro'],
          ['JPY', 'Japanese Yen'],
        ],
      },
    }).as('supportedCodes');

    cy.intercept('GET', '**/latest/*', {
      statusCode: 200,
      body: {
        time_last_update_utc: 'Sun, 19 Jul 2026 00:00:01 +0000',
        time_next_update_utc: 'Sun, 19 Jul 2026 01:00:01 +0000',
        base_code: 'MYR',
        conversion_rates: {
          USD: 0.23,
          EUR: 0.21,
          JPY: 36.7,
        },
      },
    }).as('latestRates');

    cy.intercept('GET', /\/history\/[^/]+\/\d{4}\/\d{2}\/\d{2}$/, {
      statusCode: 200,
      body: {
        base_code: 'MYR',
        year: 2026,
        month: 7,
        day: 19,
        conversion_rates: {
          USD: 0.23,
          EUR: 0.21,
          JPY: 36.7,
        },
      },
    }).as('historyRates');

    cy.intercept('GET', '**/pair/USD/EUR/10', {
      statusCode: 200,
      body: {
        conversion_rate: 0.92,
        conversion_result: 9.2,
      },
    }).as('convertCurrency');

    cy.visit('/dashboard');
    cy.wait('@supportedCodes');
    cy.wait('@latestRates');
  });

  it('renders dashboard sections and exchange rates table data', () => {
    cy.contains('Currency Exchange Rate Dashboard').should('be.visible');
    cy.contains('Real-Time Exchange Rates').should('be.visible');
    cy.contains('Historical Trends Analysis').should('be.visible');
    cy.contains('Currency Conversion Calculator').should('be.visible');

    cy.get('table tbody tr').should('have.length.at.least', 1);
    cy.contains('td', 'USD').should('be.visible');
  });

  it('changes selected base currency through dropdown interaction', () => {
    cy.get('input[aria-label="Select Base Currency Code"]').click().clear().type('USD');
    cy.get('mat-option').contains('USD - United States Dollar').click();

    cy.wait('@latestRates');
    cy.contains('Last Updated').should('be.visible');
  });

  it('converts currency amount from USD to EUR', () => {
    cy.get('input[aria-label="From"]').click().clear().type('USD');
    cy.get('mat-option').contains('USD - United States Dollar').click();

    cy.get('input[aria-label="To"]').click().clear().type('EUR');
    cy.get('mat-option').contains('EUR - Euro').click();

    cy.get('input[placeholder="Enter amount"]').clear().type('10');
    cy.contains('button', 'Convert now').click();

    cy.wait('@convertCurrency');
    cy.contains('Converted amount').should('be.visible');
    cy.contains('1 USD = 0.9200 EUR').should('be.visible');
    cy.get('div').contains('9.20').should('be.visible');
  });

  it('updates historical trend display mode and currency selection', () => {
    cy.get('input[aria-label="Compare Currency 1"]').click({ force: true }).clear().type('EUR', { force: true });
    cy.get('mat-option').contains('EUR - Euro').click();

    cy.contains('button', 'Weekly').click();
    cy.contains('button', 'Monthly').click();

    cy.wait('@historyRates');
    cy.get('canvas').should('exist');
  });
});
