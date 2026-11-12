const fillContact = async page => {
  await page.locator('#fullName').fill('Preview User')
  await page.locator('#email').fill('preview@example.com')
  await page.locator('#subject').fill('Business scope question')
  await page.locator('#message').fill('A test enquiry about the proposed business scope.')
}
const reviewOnboarding = async page => {
  await page.locator('#onboarding-name').fill('Preview User')
  await page.locator('#onboarding-email').fill('preview@example.com')
  await page.locator('#onboarding-company').fill('Example business')
  await page.getByRole('button', {name:'Continue',exact:true}).click()
  await page.locator('#onboarding-subject').fill('Business scope question')
  await page.locator('#onboarding-message').fill('A test enquiry about the proposed business scope.')
  await page.getByRole('button', {name:'Review enquiry',exact:true}).click()
  await page.locator('.enquiry-review').waitFor({state:'visible'})
}
module.exports = { fillContact, reviewOnboarding }
