#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <AuthenticationServices/AuthenticationServices.h>

// Native Apple provider UI. The resulting token must STILL be checked by
// Cloudflare against Apple's rotating JWKS, configured audience and nonce.
extern void UnitySendMessage(const char *,const char *,const char *);
@interface IIAppleIdentity : NSObject <ASAuthorizationControllerDelegate,ASAuthorizationControllerPresentationContextProviding>
@property(nonatomic,copy) NSString *receiver;
@property(nonatomic,strong) ASAuthorizationController *active;
@end
@implementation IIAppleIdentity
- (ASPresentationAnchor)presentationAnchorForAuthorizationController:(ASAuthorizationController *)controller
{
    UIWindow *window=UIApplication.sharedApplication.keyWindow;
    if(!window)window=UIApplication.sharedApplication.windows.firstObject;
    return window;
}
- (void)reply:(NSDictionary *)message
{
    NSData *data=[NSJSONSerialization dataWithJSONObject:message options:0 error:nil];
    NSString *json=data?[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]:@"{\"error\":\"invalid_response\"}";
    const char *receiver=self.receiver.UTF8String;
    if(receiver)UnitySendMessage(receiver,"OnAppleIdentityResult",json.UTF8String);
    self.active=nil;
}
- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithAuthorization:(ASAuthorization *)authorization
{
    ASAuthorizationAppleIDCredential *credential=
      [authorization.credential isKindOfClass:ASAuthorizationAppleIDCredential.class]?
       (ASAuthorizationAppleIDCredential *)authorization.credential:nil;
    NSString *token=credential.identityToken?
      [[NSString alloc] initWithData:credential.identityToken encoding:NSUTF8StringEncoding]:nil;
    if(!token||token.length<64){[self reply:@{@"error":@"token_missing"}];return;}
    [self reply:@{@"idToken":token}];
}
- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithError:(NSError *)error
{
    [self reply:@{@"error":@"cancelled_or_failed"}];
}
@end
static IIAppleIdentity *IIIdentity;
extern "C" void IIRequestAppleIdentity(const char *receiver,const char *nonce)
{
    if(!receiver||!nonce||strlen(nonce)!=43)return;
    NSString *target=[NSString stringWithUTF8String:receiver];
    NSString *secureNonce=[NSString stringWithUTF8String:nonce];
    if(!target||!secureNonce)return;
    dispatch_async(dispatch_get_main_queue(),^{
        if(!IIIdentity)IIIdentity=[IIAppleIdentity new];
        if(IIIdentity.active)return;
        IIIdentity.receiver=target;
        ASAuthorizationAppleIDProvider *provider=[ASAuthorizationAppleIDProvider new];
        ASAuthorizationAppleIDRequest *request=[provider createRequest];
        request.requestedScopes=@[];
        request.nonce=secureNonce; // SHA256(server challenge), not caller-chosen text.
        ASAuthorizationController *controller=[[ASAuthorizationController alloc] initWithAuthorizationRequests:@[request]];
        IIIdentity.active=controller;
        controller.delegate=IIIdentity;
        controller.presentationContextProvider=IIIdentity;
        [controller performRequests];
    });
}
