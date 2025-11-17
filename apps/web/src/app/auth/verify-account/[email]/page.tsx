type VerifyAccountEmailPageProps = {
    params: Promise<{ email: string}>;
}

export default async function VerifyAccountEmailPage({ params }: VerifyAccountEmailPageProps){
    const { email } = await params
}