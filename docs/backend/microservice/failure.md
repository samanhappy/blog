# 容错设计

基于分布式系统的天然不可靠，在[微服务的九个核心特征](https://martinfowler.com/articles/microservices.html#CharacteristicsOfAMicroserviceArchitecture)中，[容错设计](https://icyfenix.cn/distribution/traffic-management/failure.html)是无法忽视的。

## 容错设计模式

断路器模式和舱壁隔离模式是两种常见的容错设计模式。

断路器模式是一种防止雪崩效应的设计模式，通过在服务之间增加断路器，当某个服务出现故障时，断路器会打开，阻止请求继续传递，从而保护整个系统。

舱壁隔离模式是一种通过限制资源使用的设计模式，通过将资源隔离在不同的舱壁中，当某个舱壁出现故障时，不会影响到其他舱壁。

对比断路器和舱壁，前者更像是事后的应急处理，侧重于在故障发生时迅速采取措施；而后者则更偏向于事前的风险预防，通过隔离手段降低故障影响。它们各有所长，结合使用可以更全面地保障系统的稳定运行。

## 实现

推荐使用 [Resilience4j](https://github.com/resilience4j/resilience4j) 来实现容错设计，包括断路器、舱壁、限流、重试等。
