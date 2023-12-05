import { v4 as uuidv4} from 'uuid';
import moment from 'moment';

describe('Login and Shopping Flow Test with userCredentials.json', () => {
  before(() => {
      // Generate a UUID using uuid library
  const uuid = uuidv4();

  // Generate a timestamp using moment library
  const timestamp = moment().valueOf().toString();

  // Set localStorage values before the test starts
  cy.window().then((win) => {
    win.localStorage.setItem('backtrace-last-active', timestamp);
    win.localStorage.setItem('backtrace-guid', uuid);
  });
  
  })
after(() => {
  cy.clearCookies(), // Clear cookies before each test iteration
  cy.clearLocalStorage() // Clear local storage before each test iteration
});
const clearSessionAndStorage = () => {
  cy.clearCookies();
  cy.clearLocalStorage();
};

const performLogin = (username, password) => {
  cy.get('[data-test="username"]').type(username);
  cy.get('[data-test="password"]').type(password);
  cy.get('[data-test="login-button"]').click();
};

const checkLoggedIn = () => cy.url().then((url) => url.includes('/inventory.html'));

const addItemToCart = () => cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();

const viewCartAndProceed = () => {
  cy.get('.shopping_cart_container').click();
  cy.get('[data-test=checkout]').click();
};

const checkoutAndCompleteOrder = (firstName, lastName, postalCode) => {
  cy.get('[data-test=firstName]').type(firstName);
  cy.get('[data-test=lastName]').type(lastName);
  cy.get('[data-test=postalCode]').type(postalCode);
  cy.get('[data-test=continue]').click();
 
};

const logout = () => {
  cy.get('#react-burger-menu-btn').click();
  cy.get('#logout_sidebar_link').click();
};

  

  it('Tests login with different users and adds items to cart', () => {
    cy.visit('https://www.saucedemo.com', {
      timeout: 100000
    });
    cy.get('[data-test="username"]', {timeout: 10000}).should('be.visible');
    cy.fixture('userCredentials.json').then(users => {
      users.forEach(user => {
      
        cy.get('[data-test="username"]').type(user.username)
        cy.get('[data-test="password"]').type(user.password)
        cy.get('[data-test="login-button"]').click()

        cy.url().then(url => {
          if (url.includes('/inventory.html')) {
            // Add items to cart
             if(user.username === 'performance_glitch_user' || user.username === 'visual_user') {
          cy.get('[data-test="remove-sauce-labs-backpack"]').click();
        }
            cy.get('[data-test=add-to-cart-sauce-labs-backpack]', {timeout: 10000}).click();

            // View cart and proceed to checkout
            cy.get('.shopping_cart_container').click()
            cy.get('[data-test=checkout]').click()
            if(user.username === 'error_user') {
              cy.get('[data-test=firstName]').type('testName')
              cy.get('[data-test=postalCode]').type('34355');
              cy.get('[data-test=continue]').click()
              cy.get('#react-burger-menu-btn').click()
              cy.get('#logout_sidebar_link').click()
            }
         
            if (user.username === 'problem_user') {
              cy.get('[data-test=firstName]').type('testName')
              cy.get('[data-test=lastName]').type('testLastname')
              cy.get('[data-test=postalCode]').type('34355');
              cy.get('[data-test=continue]').click()
              cy.get('[data-test=error]').should('contain', 'Error: Last Name is required')
              cy.get('#react-burger-menu-btn').click()
              cy.get('#logout_sidebar_link').click()
            }
         
            if (user.username === 'standard_user' || user.username === 'performance_glitch_user' || user.username === 'visual_user') {
              cy.get('[data-test=firstName]').type('testName')
              cy.get('[data-test=lastName]').type('testLastname')
              cy.get('[data-test=postalCode]').type('34355');
              cy.get('[data-test=continue]').click()
              cy.get('[data-test=finish]').click()
              cy.get('.complete-header').contains('Thank you for your order!');
              cy.get('[data-test=back-to-products]').click()
              cy.get('#react-burger-menu-btn').click()
              cy.get('#logout_sidebar_link').click()
            }
    
          } else {
            cy.get('[data-test=error]').should('contain', 'Epic sadface: Sorry, this user has been locked out.')
            cy.get('[data-test="username"]').clear();
            cy.get('[data-test="password"]').clear();
          }
        })
      })
    })
  })
})
