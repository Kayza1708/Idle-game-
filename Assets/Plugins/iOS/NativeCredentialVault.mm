#import <Foundation/Foundation.h>
#import <Security/Security.h>
#include <stdlib.h>
#include <string.h>

static NSString *const IIService=@"com.kayza1708.idleintelligence.online.session";
static NSString *const IIAccount=@"company-bearer-v1";
static NSDictionary *IIQuery(void)
{
    return @{(__bridge id)kSecClass:(__bridge id)kSecClassGenericPassword,
             (__bridge id)kSecAttrService:IIService,
             (__bridge id)kSecAttrAccount:IIAccount};
}
extern "C" bool IIStoreSession(const char *token)
{
    if (!token || strlen(token)!=43)return false;
    NSData *bytes=[[NSString stringWithUTF8String:token] dataUsingEncoding:NSUTF8StringEncoding];
    if (!bytes)return false;
    SecItemDelete((__bridge CFDictionaryRef)IIQuery());
    NSMutableDictionary *args=[IIQuery() mutableCopy];
    args[(__bridge id)kSecValueData]=bytes;
    args[(__bridge id)kSecAttrAccessible]=(__bridge id)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly;
    return SecItemAdd((__bridge CFDictionaryRef)args,NULL)==errSecSuccess;
}
extern "C" char *IIReadSession(void)
{
    NSMutableDictionary *args=[IIQuery() mutableCopy];
    args[(__bridge id)kSecReturnData]=@YES;
    args[(__bridge id)kSecMatchLimit]=(__bridge id)kSecMatchLimitOne;
    CFTypeRef result=NULL;
    OSStatus status=SecItemCopyMatching((__bridge CFDictionaryRef)args,&result);
    if(status!=errSecSuccess||result==NULL)return NULL;
    NSData *data=CFBridgingRelease(result);
    if(data.length!=43)return NULL;
    char *copy=(char *)malloc(data.length+1);
    if(copy){memcpy(copy,data.bytes,data.length);copy[data.length]=0;}
    return copy;
}
extern "C" void IIClearSession(void)
{
    SecItemDelete((__bridge CFDictionaryRef)IIQuery());
}
extern "C" void IIFreeSession(char *session)
{
    free(session);
}
