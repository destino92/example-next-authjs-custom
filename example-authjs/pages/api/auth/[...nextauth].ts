import AWS from "aws-sdk"
import * as crypto from 'crypto';
import jwt_decode from "jwt-decode"
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const generateHash = (username: string, clientId: string, secretHash: string): string => {
    return crypto.createHmac('SHA256', secretHash)
        .update(username + clientId)
        .digest('base64')
}


async function getUserInfo(token) {
    try {
        const url =
            "https://id-dev-styk.auth.eu-west-1.amazoncognito.com/oauth2/userInfo?" +
            new URLSearchParams({
                access_token: token.accessToken,
            });
    
        const response = await fetch(url, {
            headers: {
            // "Content-Type": "application/application/json;",
            Authorization: `Bearer ${token.accessToken}`,
            },
        });
  
        const userInfo = await response.json();
  
        if (!response.ok) {
            throw userInfo;
        }
  
        console.log(userInfo);
        // console.log(token.accessToken);
        return {
            ...token,
            user: userInfo,
        };
    } catch (error) {
      // console.log(error);
  
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                // username: { label: "Username", type: "text", placeholder: "jsmith" },
                // password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    const cognitoIdentity = new AWS.CognitoIdentityServiceProvider({
                        region: process.env.AWS_REGION
                    })
                    // const identityPoolId: any = process.env.IDENTITY_POOL_ID;
                    // AWS.config.update({
                    //     region: process.env.AWS_REGION,
                    //     credentials: new AWS.CognitoIdentityCredentials({
                    //         IdentityPoolId: identityPoolId,
                    //     })
                    // });
                    const { username, password } = credentials as { username: string; password: string; }
                    console.log({
                        username,
                        password
                    })
                    const clientId = process.env.USER_POOL_CLIENT_ID
                    const clientSecret = process.env.USER_POOL_CLIENT_SECRET
                    const params = {
                        AuthFlow: 'USER_PASSWORD_AUTH',
                        ClientId: clientId,
                        AuthParameters: {
                            'USERNAME': username,
                            'PASSWORD': password,
                            'SECRET_HASH': generateHash(username, clientId, clientSecret)
                        }
                    }

                    const data = await cognitoIdentity.initiateAuth(params).promise()
                    console.log(data)
                    const identityToken: any = jwt_decode(data.AuthenticationResult?.IdToken)
                    console.log(identityToken)

                    return identityToken
                    
                    // console.debug("****createCredential: ", JSON.stringify(credentials))
                    // var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
                    // const UserPoolId = process.env.USER_POOL_ID
                    // const { username, password } = credentials as { username: string; password: string; }
                    // const userParams = {
                    //     "AuthParameters": {
                    //         "USERNAME": username,
                    //         "PASSWORD": password,
                    //     },
                    //     "AuthFlow": "ADMIN_USER_PASSWORD_AUTH",
                    //     "ClientId": process.env.USER_POOL_CLIENT_ID,
                    //     UserPoolId
                    // };
                    // const errorInit = await cognitoidentityserviceprovider
                    //     .adminInitiateAuth(userParams).promise()
                    //     .then((data) => {
                    //         console.log(data)
                    //         return null
                    //     })
                    //     .catch((error) => {
                    //         console.error("*****error createCredential adminInitiateAuth: ", error)
                    //         console.error(JSON.stringify(error))
                    //         return error
                    //     })
                    // if (errorInit) {
                    //     console.error("*****errorInit: ", errorInit)
                    //     if (errorInit.code) {
                    //         return Promise.reject(new Error(
                    //             errorInit.code
                    //         ))
                    //     }
                    //     return Promise.reject(new Error(
                    //         "Unknown Error"
                    //     ))
                    // }
                } catch(e) {
                    console.log(e)
                }
            }
    
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
          // Initial sign in
          if (account && user) {
            return {
              accessToken: account.access_token,
              idToken: account.id_token,
              accessTokenExpires:
                Date.now() + (account.expires_in as number) * 1000,
              refreshToken: account.refresh_token,
              user,
            };
          }
    
          // Return previous token if the access token has not expired yet
          if (Date.now() < (Date.now() + (account.expires_in as number) * 1000)) {
            return token;
          }
    
          // Access token has expired, try to update it
          // return refreshAccessToken(token);
          return getUserInfo(token);
        },
    
        async session({ session, token }) {
          session.user = token.user;
        //   session.accessToken = token.accessToken;
        //   session.idToken = token.idToken;
        //   session.error = token.error;
    
          return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
}

export default NextAuth(authOptions)