describe('Login Tests with Multiple Usernames and Passwords from JSON', () => {
  beforeEach(() => {
    //cy.clearCookies() // Clear cookies before each test iteration
    //cy.clearLocalStorage() // Clear local storage before each test iteration
    cy.intercept(
      {
        method: 'POST',
        url: 'https://events.backtrace.io/api/unique-events/submit?universe=UNIVERSE&token=TOKEN',
      },
      {
        statusCode: 200,
        body: 'API call blocked',
      }
    ).as('blockedUniqueEventsAPICall');

    cy.intercept (
      {
        method: 'POST',
        url: 'https://events.backtrace.io/api/summed-events/submit?universe=UNIVERSE&token=TOKEN',
      },
      {
        statusCode: 200,
        body: 'API call blocked',
      }
    ).as('blockedSummedEventsAPICall');
    cy.visit('/', {
      timeout: 10000
    })
    
  })
  it('Test login with different users', () => {
    cy.fixture('userCredentials.json').then(users => {
      users.forEach((user, index) => {
        

        // Fill in the login form with current user credentials
        cy.get('[data-test="username"]').type(user.username)
        cy.get('[data-test="password"]').type(user.password)
        cy.get('[data-test="login-button"]').click()

       
        cy.url().then(url => {
          if (url.includes('/inventory.html')) {
            cy.get('.title').should('contain', 'Products')
            cy.get('.bm-burger-button').click();
            cy.get('#logout_sidebar_link').click();
          } else {
            cy.get('[data-test="error"]').should('contain', 'Username and password do not match any user in this service')
          }
        })
      })
    })
  })
})
