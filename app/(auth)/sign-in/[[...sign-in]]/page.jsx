import { SignIn } from '@clerk/nextjs'

const Page = () => {
  return <SignIn afterSignInUrl='/dashboard'/>;
}

export default Page