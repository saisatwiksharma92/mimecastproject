import { v4 as uuidv4} from 'uuid';
import moment from 'moment';

describe('Login and Shopping Flow Test with userCredentials.json', () => {
  
  const clearSessionAndStorage = () => {
    cy.clearCookies();
    cy.clearLocalStorage();
  };
  
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
// Login function
  const performLogin = (username, password) => {
    cy.get('[data-test="username"]').type(username);
    cy.get('[data-test="password"]').type(password);
    cy.get('[data-test="login-button"]').click();
  };

  // Login verification
  const checkLoggedIn = () => cy.url().then((url) => url.includes('/inventory.html'));

  // Add to Cart
  const addItemToCart = () => cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();

  // Viewing Cart and Proceeding
  const viewCartAndProceed = () => {
    cy.get('.shopping_cart_container').click();
    cy.get('[data-test=checkout]').click();
  };

  // Checkout and Complete Order
  const checkoutAndCompleteOrder = (firstName, lastName, postalCode) => {
    cy.get('[data-test=firstName]').type(firstName);
    cy.get('[data-test=lastName]').type(lastName);
    cy.get('[data-test=postalCode]').type(postalCode);
    cy.get('[data-test=continue]').click();
  };

  // Logout function
  const logout = () => {
    cy.get('#react-burger-menu-btn').click();
    cy.get('#logout_sidebar_link').click();
  };


  const handleUserScenario = (user) => {
    performLogin(user.username, user.password);

    checkLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        if (user.username === 'performance_glitch_user' || user.username === 'visual_user') {
          cy.get('[data-test="remove-sauce-labs-backpack"]').click();
        }

        if (user.username === 'error_user') {
          addItemToCart();
          viewCartAndProceed();
          cy.get('[data-test=firstName]').type('test');
          cy.get('[data-test=postalCode]').type('343535');
          cy.get('[data-test=continue]').click();
          logout();
        }

        if (user.username === 'problem_user') {
          addItemToCart();
          viewCartAndProceed();
          checkoutAndCompleteOrder('testName', 'testLastname', '34355');
          cy.get('[data-test=error]').should('contain', 'Error: Last Name is required');
          logout();
        }

        if (
          user.username === 'standard_user' ||
          user.username === 'performance_glitch_user' ||
          user.username === 'visual_user'
        ) {
          addItemToCart();
          viewCartAndProceed();
          checkoutAndCompleteOrder('testName', 'testLastname', '34355');
          cy.get('[data-test=finish]').click();
          cy.get('.complete-header').contains('Thank you for your order!');
          cy.get('[data-test=back-to-products]').click();
          logout();
        }
      } else {
        cy.get('[data-test=error]').should('contain', 'Epic sadface: Sorry, this user has been locked out.');
        cy.get('[data-test="username"]').clear();
        cy.get('[data-test="password"]').clear();
      }
    });
  };

  beforeEach(() => {
    cy.visit('', { timeout: 100000 });
  });

  afterEach(() => {
    clearSessionAndStorage();
  });

  it('Tests login, shopping, and checkout flow with various users', () => {
    cy.fixture('userCredentials.json').then((users) => {
      users.forEach((user) => {
        handleUserScenario(user);
      });
    });
  });
});
