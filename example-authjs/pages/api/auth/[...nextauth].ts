import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            type: "credentials",
            credentials: {
                // username: { label: "Username", type: "text", placeholder: "jsmith" },
                // password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    console.debug("****createCredential: ", JSON.stringify(credentials))
                    var aws = require('aws-sdk');
                        aws.config.update({
                            region: 'us-east-1',
                            credentials: new aws.CognitoIdentityCredentials({
                                IdentityPoolId: '???'
                        })
                    });
                    var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider();
                    const UserPoolId = process.env.SOMEPOOLID
                    const { username, password } = credentials as { username: string; password: string; }
                    const userParams = {
                        "AuthParameters": {
                            "USERNAME": username,
                            "PASSWORD": password,
                        },
                        "AuthFlow": "ADMIN_NO_SRP_AUTH",
                        "ClientId": process.env.SOMECLIENTID,
                        UserPoolId
                    };
                    const errorInit = await cognitoidentityserviceprovider
                        .adminInitiateAuth(userParams).promise()
                        .then((data) => {
                            return null
                        })
                        .catch((error) => {
                            console.error("*****error createCredential adminInitiateAuth: ", error)
                            console.error(JSON.stringify(error))
                            return error
                        })
                    if (errorInit) {
                        console.error("*****errorInit: ", errorInit)
                        if (errorInit.code) {
                            return Promise.reject(new Error(
                                errorInit.code
                            ))
                        }
                        return Promise.reject(new Error(
                            "Unknown Error"
                        ))
                    }
                } catch(e) {
                    console.log(e)
                }
            }
    
        })
    ]
}

export default NextAuth(authOptions)