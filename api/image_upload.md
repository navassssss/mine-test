fetch("https://www.kimi.com/apiv2-files/file/upload", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,ml;q=0.8",
    "authorization": "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTunLz2fxMOGmBrV9",
    "priority": "u=1, i",
    "r-timezone": "Asia/Calcutta",
    "sec-ch-ua": "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-language": "en-US",
    "x-msh-device-id": "7649782498766892810",
    "x-msh-platform": "web",
    "x-msh-session-id": "1731642852852109865",
    "x-msh-shield-data": "sg:LGm1nWMB3qoOLPN3gp73CO3s2X",
    "x-msh-version": "1.0.0",
    "x-traffic-id": "d7makaun3mk3r6v4rgq0",
    "cookie": "theme=dark; _ga=GA1.1.370269376.1781103784; g_state={\"i_l\":0,\"i_ll\":1781103785746,\"i_e\":{\"enable_itp_optimization\":0},\"i_et\":1781103785729}; kimi-auth=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg; lang=en-US; _clck=1pf5a8b%5E2%5Eg72%5E0%5E2362; _ga_Z0ZTEN03PZ=GS2.1.s1781964724$o2$g0$t1781964724$j60$l0$h0; _gcl_au=1.1.364708090.1781103785.971853792.1781965647.1781965646; Hm_lvt_358cae4815e85d48f7e8ab7f3680a74b=1781885858,1781923647,1781938280,1782054744; HMACCOUNT=A7A9747C0E06B989; doodle_asset=%257B%2522id%2522%253A%252219ef2b79-8532-86c0-8000-0000eb3d152e%2522%252C%2522assetUrl%2522%253A%2522https%253A%252F%252Fkimi-img.moonshot.cn%252Fpub%252Fslides%252Fkimi-fs%252Foutsight%252F260623-12%253A22%253A17_turing_doodle.riv%2522%252C%2522link%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.Link%2522%252C%2522doodleLink%2522%253A%2522kimi%253A%252F%252Fpath%253Fzh_case_id%253Dd8t05skn907fpvs8b78g%2526en_case_id%253Dd8t08kcn907fpvs8b7sg%2522%257D%252C%2522welcomeMessage%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.WelcomeMessage%2522%252C%2522messages%2522%253A%257B%257D%257D%257D; Hm_lpvt_358cae4815e85d48f7e8ab7f3680a74b=1782215449; _ga_YXD8W70SZP=GS2.1.s1782207785$o36$g1$t1782215509$j60$l0$h0; __cf_bm=uGYOTLPw7nPPyh4PyhbUX8CSeTK0XDKv.6lYRUoOGrw-1782215547.1425421-1.0.1.1-nU7KYt92teBDSyScB4lQgGHCmnCinL0LUXFIrFof53KtMawbYv27qUVaZuHxd.AO_CE07ZR1n.t78argI0dQuR5euGdNAYva79sEBkLZREmKex.abPYOplxL9uYigxV9",
    "Referer": "https://www.kimi.com/chat/19ef2f5d-e412-8546-8000-09701e52c421?chat_enter_method=history"
  },
  "body": "------WebKitFormBoundaryTunLz2fxMOGmBrV9\r\nContent-Disposition: form-data; name=\"file\"; filename=\"WhatsApp Image 2026-06-23 at 07.33.00.jpeg\"\r\nContent-Type: image/jpeg\r\n\r\n\r\n------WebKitFormBoundaryTunLz2fxMOGmBrV9--\r\n",
  "method": "POST"
});

{
    "file": {
        "id": "19ef4563-bb52-89bb-8000-00004f66f21c",
        "meta": {
            "name": "WhatsApp Image 2026-06-23 at 07.33.00.jpeg",
            "contentType": "image/jpeg",
            "sizeBytes": "183734",
            "checksum": "ac273653483493f5d8e033b10890d0649ef34886ba69c82135285cccce2cb4f3",
            "ext": "jpeg",
            "createTime": "2026-06-23T11:55:52.555537Z",
            "type": "FILE_TYPE_IMAGE"
        },
        "blob": {
            "signUrl": "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fac273653483493f5d8e033b10890d0649ef34886ba69c82135285cccce2cb4f3?filename=WhatsApp+Image+2026-06-23+at+07.33.00.jpeg&sig=vP__CXq1ZF3ExlpTTrMt2EcPk5L1VEdGLWsRmcBcV0g=&t=o",
            "previewUrl": ""
        },
        "parseResult": {
            "thumbnail": {
                "thumbnailUrl": "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fac273653483493f5d8e033b10890d0649ef34886ba69c82135285cccce2cb4f3?filename=WhatsApp+Image+2026-06-23+at+07.33.00.jpeg&sig=p1luqJcgo2uRR6IvF86mC58C5igKP0Yp54qK7_40RqY=&t=t",
                "previewUrl": "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fac273653483493f5d8e033b10890d0649ef34886ba69c82135285cccce2cb4f3?filename=WhatsApp+Image+2026-06-23+at+07.33.00.jpeg&sig=ikjfrO0eSUeVtH_7cBdAKJKYnYwKJgcI7i79p_HPEg8=&t=p",
                "mobileThumbnailUrl": "https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fac273653483493f5d8e033b10890d0649ef34886ba69c82135285cccce2cb4f3?filename=WhatsApp+Image+2026-06-23+at+07.33.00.jpeg&sig=OJP9gh7fnerFRG640HGTc4UjtcFWp5jnhDkjUYFmK1Q=&t=m"
            }
        }
    }
}
fetch("https://www.kimi.com/apiv2-files/kimi.gateway.file.v1.FileService/GetFileParseProgress", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,ml;q=0.8",
    "authorization": "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg",
    "connect-protocol-version": "1",
    "content-type": "application/json",
    "priority": "u=1, i",
    "r-timezone": "Asia/Calcutta",
    "sec-ch-ua": "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-language": "en-US",
    "x-msh-device-id": "7649782498766892810",
    "x-msh-platform": "web",
    "x-msh-session-id": "1731642852852109865",
    "x-msh-shield-data": "sg:q4FVDWpBPWVSRVWUYdt9ROungX",
    "x-msh-version": "1.0.0",
    "x-traffic-id": "d7makaun3mk3r6v4rgq0",
    "cookie": "theme=dark; _ga=GA1.1.370269376.1781103784; g_state={\"i_l\":0,\"i_ll\":1781103785746,\"i_e\":{\"enable_itp_optimization\":0},\"i_et\":1781103785729}; kimi-auth=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg; lang=en-US; _clck=1pf5a8b%5E2%5Eg72%5E0%5E2362; _ga_Z0ZTEN03PZ=GS2.1.s1781964724$o2$g0$t1781964724$j60$l0$h0; _gcl_au=1.1.364708090.1781103785.971853792.1781965647.1781965646; Hm_lvt_358cae4815e85d48f7e8ab7f3680a74b=1781885858,1781923647,1781938280,1782054744; HMACCOUNT=A7A9747C0E06B989; doodle_asset=%257B%2522id%2522%253A%252219ef2b79-8532-86c0-8000-0000eb3d152e%2522%252C%2522assetUrl%2522%253A%2522https%253A%252F%252Fkimi-img.moonshot.cn%252Fpub%252Fslides%252Fkimi-fs%252Foutsight%252F260623-12%253A22%253A17_turing_doodle.riv%2522%252C%2522link%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.Link%2522%252C%2522doodleLink%2522%253A%2522kimi%253A%252F%252Fpath%253Fzh_case_id%253Dd8t05skn907fpvs8b78g%2526en_case_id%253Dd8t08kcn907fpvs8b7sg%2522%257D%252C%2522welcomeMessage%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.WelcomeMessage%2522%252C%2522messages%2522%253A%257B%257D%257D%257D; Hm_lpvt_358cae4815e85d48f7e8ab7f3680a74b=1782215449; _ga_YXD8W70SZP=GS2.1.s1782207785$o36$g1$t1782215509$j60$l0$h0; __cf_bm=uGYOTLPw7nPPyh4PyhbUX8CSeTK0XDKv.6lYRUoOGrw-1782215547.1425421-1.0.1.1-nU7KYt92teBDSyScB4lQgGHCmnCinL0LUXFIrFof53KtMawbYv27qUVaZuHxd.AO_CE07ZR1n.t78argI0dQuR5euGdNAYva79sEBkLZREmKex.abPYOplxL9uYigxV9",
    "Referer": "https://www.kimi.com/chat/19ef2f5d-e412-8546-8000-09701e52c421?chat_enter_method=history"
  },
  "body": "{\"file_ids\":[\"19ef4563-bb52-89bb-8000-00004f66f21c\"]}",
  "method": "POST"
});

{
    "progresses": [
        {
            "fileId": "19ef4563-bb52-89bb-8000-00004f66f21c",
            "status": "PROCESS_STATUS_PROCESSING"
        }
    ]
}

fetch("https://www.kimi.com/apiv2-files/kimi.gateway.file.v1.FileService/GetFileParseProgress", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,ml;q=0.8",
    "authorization": "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg",
    "connect-protocol-version": "1",
    "content-type": "application/json",
    "priority": "u=1, i",
    "r-timezone": "Asia/Calcutta",
    "sec-ch-ua": "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-language": "en-US",
    "x-msh-device-id": "7649782498766892810",
    "x-msh-platform": "web",
    "x-msh-session-id": "1731642852852109865",
    "x-msh-shield-data": "sg:Uz6pbWjYwgFjxFj3ZRLuDuedfX",
    "x-msh-version": "1.0.0",
    "x-traffic-id": "d7makaun3mk3r6v4rgq0",
    "cookie": "theme=dark; _ga=GA1.1.370269376.1781103784; g_state={\"i_l\":0,\"i_ll\":1781103785746,\"i_e\":{\"enable_itp_optimization\":0},\"i_et\":1781103785729}; kimi-auth=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg; lang=en-US; _clck=1pf5a8b%5E2%5Eg72%5E0%5E2362; _ga_Z0ZTEN03PZ=GS2.1.s1781964724$o2$g0$t1781964724$j60$l0$h0; _gcl_au=1.1.364708090.1781103785.971853792.1781965647.1781965646; Hm_lvt_358cae4815e85d48f7e8ab7f3680a74b=1781885858,1781923647,1781938280,1782054744; HMACCOUNT=A7A9747C0E06B989; doodle_asset=%257B%2522id%2522%253A%252219ef2b79-8532-86c0-8000-0000eb3d152e%2522%252C%2522assetUrl%2522%253A%2522https%253A%252F%252Fkimi-img.moonshot.cn%252Fpub%252Fslides%252Fkimi-fs%252Foutsight%252F260623-12%253A22%253A17_turing_doodle.riv%2522%252C%2522link%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.Link%2522%252C%2522doodleLink%2522%253A%2522kimi%253A%252F%252Fpath%253Fzh_case_id%253Dd8t05skn907fpvs8b78g%2526en_case_id%253Dd8t08kcn907fpvs8b7sg%2522%257D%252C%2522welcomeMessage%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.WelcomeMessage%2522%252C%2522messages%2522%253A%257B%257D%257D%257D; Hm_lpvt_358cae4815e85d48f7e8ab7f3680a74b=1782215449; _ga_YXD8W70SZP=GS2.1.s1782207785$o36$g1$t1782215509$j60$l0$h0; __cf_bm=uGYOTLPw7nPPyh4PyhbUX8CSeTK0XDKv.6lYRUoOGrw-1782215547.1425421-1.0.1.1-nU7KYt92teBDSyScB4lQgGHCmnCinL0LUXFIrFof53KtMawbYv27qUVaZuHxd.AO_CE07ZR1n.t78argI0dQuR5euGdNAYva79sEBkLZREmKex.abPYOplxL9uYigxV9",
    "Referer": "https://www.kimi.com/chat/19ef2f5d-e412-8546-8000-09701e52c421?chat_enter_method=history"
  },
  "body": "{\"file_ids\":[\"19ef4563-bb52-89bb-8000-00004f66f21c\"]}",
  "method": "POST"
});

{
    "progresses": [
        {
            "fileId": "19ef4563-bb52-89bb-8000-00004f66f21c",
            "status": "PROCESS_STATUS_SUCCESS"
        }
    ]
}


<!-- Chat with image -->
fetch("https://www.kimi.com/apiv2/kimi.gateway.chat.v1.ChatService/Chat", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,ml;q=0.8",
    "authorization": "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg",
    "connect-protocol-version": "1",
    "content-type": "application/connect+json",
    "priority": "u=1, i",
    "r-timezone": "Asia/Calcutta",
    "sec-ch-ua": "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-language": "en-US",
    "x-msh-device-id": "7649782498766892810",
    "x-msh-platform": "web",
    "x-msh-session-id": "1731642852852109865",
    "x-msh-shield-data": "sg:pWLVSWELMCUd09osdG4kANMPe8",
    "x-msh-version": "1.0.0",
    "x-traffic-id": "d7makaun3mk3r6v4rgq0",
    "cookie": "theme=dark; _ga=GA1.1.370269376.1781103784; g_state={\"i_l\":0,\"i_ll\":1781103785746,\"i_e\":{\"enable_itp_optimization\":0},\"i_et\":1781103785729}; kimi-auth=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc4MzY5NTc5NywiaWF0IjoxNzgxMTAzNzk3LCJqdGkiOiJkOGtucGRjcWRxZWxza2swZzFiZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJkN21ha2F1bjNtazNyNnY0cmdxMCIsInNwYWNlX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZmciLCJhYnN0cmFjdF91c2VyX2lkIjoiZDdtYWthbW4zbWszcjZ2NHI1ZjAiLCJzc2lkIjoiMTczMTY0Mjg1Mjg1MjEwOTg2NSIsImRldmljZV9pZCI6Ijc2NDk3ODI0OTg3NjY4OTI4MTAiLCJyZWdpb24iOiJvdmVyc2VhcyIsIm1lbWJlcnNoaXAiOnsibGV2ZWwiOjEwfX0.U5PvZDJ48NKX5wuoPIKNW164W_d9WJCbZBAG81JqVxlaMMYA_Qizoh1BQyf8_LdixsSUhOEkpJkphtMwvDaEFg; lang=en-US; _clck=1pf5a8b%5E2%5Eg72%5E0%5E2362; _ga_Z0ZTEN03PZ=GS2.1.s1781964724$o2$g0$t1781964724$j60$l0$h0; _gcl_au=1.1.364708090.1781103785.971853792.1781965647.1781965646; Hm_lvt_358cae4815e85d48f7e8ab7f3680a74b=1781885858,1781923647,1781938280,1782054744; HMACCOUNT=A7A9747C0E06B989; doodle_asset=%257B%2522id%2522%253A%252219ef2b79-8532-86c0-8000-0000eb3d152e%2522%252C%2522assetUrl%2522%253A%2522https%253A%252F%252Fkimi-img.moonshot.cn%252Fpub%252Fslides%252Fkimi-fs%252Foutsight%252F260623-12%253A22%253A17_turing_doodle.riv%2522%252C%2522link%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.Link%2522%252C%2522doodleLink%2522%253A%2522kimi%253A%252F%252Fpath%253Fzh_case_id%253Dd8t05skn907fpvs8b78g%2526en_case_id%253Dd8t08kcn907fpvs8b7sg%2522%257D%252C%2522welcomeMessage%2522%253A%257B%2522%2524typeName%2522%253A%2522kimi.gateway.doodle.v1.WelcomeMessage%2522%252C%2522messages%2522%253A%257B%257D%257D%257D; Hm_lpvt_358cae4815e85d48f7e8ab7f3680a74b=1782215449; _ga_YXD8W70SZP=GS2.1.s1782207785$o36$g1$t1782215509$j60$l0$h0; __cf_bm=uGYOTLPw7nPPyh4PyhbUX8CSeTK0XDKv.6lYRUoOGrw-1782215547.1425421-1.0.1.1-nU7KYt92teBDSyScB4lQgGHCmnCinL0LUXFIrFof53KtMawbYv27qUVaZuHxd.AO_CE07ZR1n.t78argI0dQuR5euGdNAYva79sEBkLZREmKex.abPYOplxL9uYigxV9",
    "Referer": "https://www.kimi.com/chat/19ef2f5d-e412-8546-8000-09701e52c421?chat_enter_method=history"
  },
  "body": "\u0000\u0000\u0000\u0001¯{\"chat_id\":\"19ef2f5d-e412-8546-8000-09701e52c421\",\"scenario\":\"SCENARIO_K2D5\",\"tools\":[{\"type\":\"TOOL_TYPE_SEARCH\",\"search\":{}}],\"message\":{\"parent_id\":\"19ef4329-ed72-8957-8000-0a7063ef7a42\",\"role\":\"user\",\"blocks\":[{\"message_id\":\"\",\"text\":{\"content\":\"test image\"}},{\"file\":{\"id\":\"19ef4563-bb52-89bb-8000-00004f66f21c\",\"status\":\"PROCESS_STATUS_SUCCESS\"}}],\"scenario\":\"SCENARIO_K2D5\"},\"options\":{\"thinking\":false,\"enable_plugin\":true}}",
  "method": "POST"
});