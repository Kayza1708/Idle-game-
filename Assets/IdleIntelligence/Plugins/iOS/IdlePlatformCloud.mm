#import <Foundation/Foundation.h>
#import <GameKit/GameKit.h>
#import <UIKit/UIKit.h>
#import <TargetConditionals.h>
extern "C" void UnitySendMessage(const char *,const char *,const char *);
static NSArray<GKSavedGame *> *idleSaves;
static void Reply(NSString *target,NSString *request,NSDictionary *result) {
    NSMutableDictionary *value=[result mutableCopy];value[@"request"]=request;
    NSData *json=[NSJSONSerialization dataWithJSONObject:value options:0 error:nil];
    NSString *text=[[NSString alloc] initWithData:json encoding:NSUTF8StringEncoding];
    dispatch_async(dispatch_get_main_queue(), ^{UnitySendMessage(target.UTF8String,"OnCloudReply",text.UTF8String);});
}
static void Fail(NSString *target,NSString *request,NSError *error) {
    Reply(target,request,@{@"error":error.localizedDescription?:@"Platform cloud unavailable"});
}
extern "C" void IdleCloudRequest(const char *targetUtf8,const char *requestUtf8,const char *operationUtf8,const char *valueUtf8) {
    NSString *target=[NSString stringWithUTF8String:targetUtf8],*request=[NSString stringWithUTF8String:requestUtf8];
    NSString *operation=[NSString stringWithUTF8String:operationUtf8],*value=[NSString stringWithUTF8String:valueUtf8];
#if TARGET_OS_SIMULATOR
    Reply(target,request,@{@"error":@"iCloud game saves require a provisioned physical Apple device; simulator is not an acceptance test"});return;
#else
    if(![[NSBundle mainBundle] objectForInfoDictionaryKey:@"IdleCloudEnabled"]||![[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IdleCloudEnabled"] boolValue]) {
        Reply(target,request,@{@"error":@"iCloud container and signing must be configured for this app"});return;
    }
    if(![NSFileManager defaultManager].ubiquityIdentityToken){Reply(target,request,@{@"error":@"Sign in to iCloud and enable iCloud Drive"});return;}
    if([operation isEqualToString:@"list"]) {
        [[GKLocalPlayer localPlayer] fetchSavedGamesWithCompletionHandler:^(NSArray<GKSavedGame *> *games,NSError *error){
            if(error){Fail(target,request,error);return;}
            // Keep all conflicting variants. Never silently pick newest or merge rewards.
            idleSaves=[games copy];NSMutableArray *entries=[NSMutableArray array];
            for(NSUInteger index=0;index<games.count;index++){
                GKSavedGame *game=games[index];if(![game.name hasPrefix:@"idle-unity-"])continue;
                [entries addObject:@{@"key":[NSString stringWithFormat:@"%lu",(unsigned long)index],@"name":game.name?:@"",@"device":game.deviceName?:@"",@"modified":@([game.modificationDate timeIntervalSince1970]*1000)}];
            }
            Reply(target,request,@{@"entries":entries,@"ok":@YES});
        }];return;
    }
    if([operation isEqualToString:@"read"]) {
        NSScanner *scanner=[NSScanner scannerWithString:value];NSInteger index=-1;
        if(![scanner scanInteger:&index]||!scanner.isAtEnd||index<0||(NSUInteger)index>=idleSaves.count){Reply(target,request,@{@"error":@"Cloud selection expired; refresh the list"});return;}
        [idleSaves[index] loadDataWithCompletionHandler:^(NSData *data,NSError *error){
            if(error||!data){Fail(target,request,error);return;}
            if(data.length>2*1024*1024){Reply(target,request,@{@"error":@"Cloud snapshot exceeds transport limit"});return;}
            Reply(target,request,@{@"payload":[data base64EncodedStringWithOptions:0],@"ok":@YES});
        }];return;
    }
    if([operation isEqualToString:@"write"]) {
        NSData *json=[value dataUsingEncoding:NSUTF8StringEncoding];NSDictionary *args=[NSJSONSerialization JSONObjectWithData:json options:0 error:nil];
        NSString *name=args[@"name"];NSData *data=[[NSData alloc] initWithBase64EncodedString:args[@"payload"] options:0];
        if(![name hasPrefix:@"idle-unity-"]||name.length>128||data.length==0||data.length>2*1024*1024){Reply(target,request,@{@"error":@"Invalid cloud snapshot request"});return;}
        [[GKLocalPlayer localPlayer] saveGameData:data withName:name completionHandler:^(GKSavedGame *game,NSError *error){if(error||!game){Fail(target,request,error);return;}Reply(target,request,@{@"ok":@YES});}];return;
    }
    Reply(target,request,@{@"error":@"Unknown cloud operation"});
#endif
}
