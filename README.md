# issue
- [ ] : 如何設定上傳 ECR 的 Image 名稱?

![ecr_image_name](./assets/ecr_image_name.png)



## ECS, Service, Fargate_Spot 問題

- 在設定 fargate_spot 時, 出現問題

![fargate_spot_issue](./assets/fargate_spot_issue.png)

- 如果先將以下設定關閉, 進行部署, 再打開, 再部署, 則不會有問題

```
// set ecs service strategy
const strategy = [{ capacityProvider: "FARGATE_SPOT", weight: 1 }];
const theFirst: ecs.CfnService = ecsSvc.node.children[0] as ecs.CfnService;
theFirst.addPropertyOverride("capacityProviderStrategy", strategy);
```

### before
![fargate_type](./assets/fargate_type.png)

### after
![fargate_spot_type](./assets/fargate_spot_type.png)
