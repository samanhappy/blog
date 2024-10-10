## 听说你很懂 ReentrantReadWriteLock，敢来测试一下吗 ？
### 测试
先来看一段代码：
```java
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReentrantReadWriteLockTest {

  public static void main(String[] args) throws InterruptedException {

    ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    ReentrantReadWriteLock.ReadLock readLock = rwLock.readLock();
    ReentrantReadWriteLock.WriteLock writeLock = rwLock.writeLock();

    // 第一个线程尝试获取读锁，可以成功
    readLock.lock();
    System.out.println("第一次获取读锁成功");

    // 第二个线程尝试获取写锁，会被阻塞
    new Thread(
            () -> {
              writeLock.lock();
              System.out.println("获取写锁成功");
              writeLock.unlock();
            })
        .start();

    // 第三个线程获取读锁，成功还是阻塞？
    new Thread(
            () -> {
              try {
                // 睡眠一段时间，确保第二个线程已经在等待获取写锁
                Thread.sleep(1000);
              } catch (InterruptedException ignored) {
              }
              readLock.lock();
              System.out.println("第二次获取读锁成功");
              readLock.unlock();
            })
        .start();

    // 睡眠一段时间，确保第三个线程已经在等待获取读锁
    Thread.sleep(3000);
    readLock.unlock();
  }
}
```
这段代码中，我们创建了一个 `ReentrantReadWriteLock` 实例，第一个线程尝试获取读锁，第二个线程尝试获取写锁，第三个线程再次尝试获取读锁。请问，第三个线程会成功获取读锁吗？实际打印出来的结果给你两个选项：

A
```
第一次获取读锁成功
获取写锁成功
第二次获取读锁成功
```
B
```
第一次获取读锁成功
第二次获取读锁成功
获取写锁成功
```
你会选择哪个？先不要急着回答，思考一下，然后再看下面的解析。
### 简介
回顾一下，在 Java 的多线程编程中，`ReentrantReadWriteLock` 是一个非常重要的工具，用于解决并发场景下的线程安全问题。与传统的独占锁不同，`ReentrantReadWriteLock` 允许多个读线程同时访问资源，但在写线程访问时，会阻塞所有其他读线程和写线程。这种设计在处理读多写少的场景时，可以显著提高应用程序的性能。
### 特点
1. **公平性与非公平性**：`ReentrantReadWriteLock` 支持两种锁获取方式：非公平（默认）和公平。非公平锁在性能上更优，因为它不保证线程获取锁的顺序，减少了上下文切换和调度开销。公平锁则按照线程请求锁的顺序来获取锁，虽然行为更容易预测，但可能会增加额外的开销。
2. **重入性**：`ReentrantReadWriteLock` 支持重入，即线程在获取读锁或写锁后，可以再次获取相同的锁，甚至可以从写锁降级为读锁。
3. **锁降级**：这是一个独特的特性，允许线程在持有写锁的情况下获取读锁，然后释放写锁，从而实现锁的降级。这样做的好处是可以在保持数据一致性的同时，允许其他线程进行并发读取。
### 实现原理
`ReentrantReadWriteLock` 内部维护了两个锁：读锁（共享锁）和写锁（独占锁）。读锁可以被多个线程同时获取，而写锁一次只能被一个线程获取。此外，当线程获取读锁时，其他线程不能获取写锁，反之亦然。
在实现上，`ReentrantReadWriteLock` 通过重写 `AbstractQueuedSynchronizer`（AQS）中的方法来实现其同步语义。AQS 是一个用于构建锁和其他同步组件的框架，它提供了一个基于队列的同步框架，用于构建锁和其他同步装置。
### 使用场景
`ReentrantReadWriteLock` 非常适合用在读操作远多于写操作的场景，例如缓存系统或数据仓库应用。在这些场景下，允许多个线程同时读取数据可以显著提高系统的吞吐量。
### 解析
现在，我们来看一下上面的代码。根据 `ReentrantReadWriteLock` 的特性，第一个线程获取了读锁，第二个线程尝试获取写锁，会被阻塞。到这里，一切都符合预期。但是，第三个线程尝试获取读锁，会成功还是阻塞呢？如果按照 `ReentrantReadWriteLock` 的特性，第三个线程应该可以成功获取读锁，因为读锁是共享锁，不会阻塞其他读线程。但是，实际上，第三个线程却被阻塞了，正确的输出应该是 B：
```
第一次获取读锁成功
获取写锁成功
第二次获取读锁成功
```
这是为什么呢？上面说过，`ReentrantReadWriteLock` 默认是非公平锁，那么它是如何实现的呢？我们来看一下 `NonfairSync` 的源码：
```java
    static final class NonfairSync extends Sync {
        private static final long serialVersionUID = -8159625535654395037L;
        final boolean writerShouldBlock() {
            return false; // writers can always barge
        }
        final boolean readerShouldBlock() {
            /* As a heuristic to avoid indefinite writer starvation,
             * block if the thread that momentarily appears to be head
             * of queue, if one exists, is a waiting writer.  This is
             * only a probabilistic effect since a new reader will not
             * block if there is a waiting writer behind other enabled
             * readers that have not yet drained from the queue.
             */
            return apparentlyFirstQueuedIsExclusive();
        }
    }
```
注意 `NonfairSync` 中的 `readerShouldBlock` 方法返回了 `apparentlyFirstQueuedIsExclusive()` 的结果。这个方法的作用是判断队列中第一个节点是否是写节点，如果是，则返回 `true`，否则返回 `false`。这就是为什么第三个线程被阻塞的原因。注意，这里的阻塞是一个概率性的阻塞，因为它只是一个启发式的判断，不是绝对的。因为如果队列中第一个节点是一个读节点，那么第三个线程是可以成功获取读锁的，虽然我没有想到什么情况下会出现这种情况（有高手知道的话，欢迎留言告诉我）。
