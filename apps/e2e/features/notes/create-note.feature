Feature: Create a note

  Scenario: Successfully create a note
    Given I am on "/notes/new"
    When I type "My E2E Note" into "Title"
    And I type "Written by Playwright" into "Body"
    And I click "Create"
    Then I should see "My E2E Note"
    And the URL should contain "/notes/"
