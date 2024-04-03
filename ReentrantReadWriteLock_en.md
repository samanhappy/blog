# Ready for the Challenge? Testing ReentrantReadWriteLock Understanding

## The Test

Let's start with some code:

```java
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReentrantReadWriteLockTest {

  public static void main(String[] args) throws InterruptedException {

    ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    ReentrantReadWriteLock.ReadLock readLock = rwLock.readLock();
    ReentrantReadWriteLock.WriteLock writeLock = rwLock.writeLock();

    // The first thread attempts to acquire the read lock, and succeeds
    readLock.lock();
    System.out.println("First read lock acquired successfully");

    // The second thread attempts to acquire the write lock, and is blocked
    new Thread(
            () -> {
              writeLock.lock();
              System.out.println("Write lock acquired");
              writeLock.unlock();
            })
        .start();

    // The third thread attempts to acquire the read lock again - will it succeed or be blocked?
    new Thread(
            () -> {
              try {
                // Sleep for a while to ensure the second thread is waiting to acquire the write lock
                Thread.sleep(1000);
              } catch (InterruptedException ignored) {
              }
              readLock.lock();
              System.out.println("Second read lock acquired");
              readLock.unlock();
            })
        .start();

    // Sleep for a while to ensure the third thread is waiting to acquire the read lock
    Thread.sleep(3000);
    readLock.unlock();
  }
}
```

In this code, we create an instance of `ReentrantReadWriteLock`. The first thread tries to acquire the read lock, the second thread attempts to acquire the write lock, and the third thread tries to acquire the read lock again. Now, here's the question: Will the third thread successfully acquire the read lock? The actual output will provide you with two options:

A

```plain
First read lock acquired successfully
Write lock acquired
Second read lock acquired
```

B

```plain
First read lock acquired successfully
Second read lock acquired
Write lock acquired
```

Which one would you choose? Don't rush to answer. Ponder over it for a moment, and then take a look at the explanation below.

### Introduction

In the realm of Java multithreading, `ReentrantReadWriteLock` stands as a crucial tool to tackle concurrency issues. Unlike traditional exclusive locks, `ReentrantReadWriteLock` allows multiple threads to read from a resource simultaneously. However, when a write thread accesses the resource, it blocks all other threads—both readers and writers. This design significantly enhances application performance, especially in scenarios with frequent reads and infrequent writes.

### Key Features

1. **Fairness vs. Unfairness**: `ReentrantReadWriteLock` supports two lock acquisition modes: unfair (default) and fair. Unfair locks tend to perform better as they don't guarantee lock acquisition in the order of thread requests, thereby reducing context switching and scheduling overhead. Fair locks, on the other hand, prioritize lock acquisition based on thread request order, which might introduce additional overhead despite its predictable behavior.

2. **Reentrancy**: `ReentrantReadWriteLock` supports reentrancy, allowing threads to reacquire the same lock multiple times, even degrading from a write lock to a read lock.

3. **Lock Downgrading**: This unique feature enables a thread to acquire a read lock while holding a write lock and subsequently release the write lock, thereby downgrading the lock. This approach ensures data consistency while facilitating concurrent reads by other threads.

### Implementation Details

Internally, `ReentrantReadWriteLock` maintains two locks: the read lock (shared lock) and the write lock (exclusive lock). While multiple threads can acquire the read lock simultaneously, only one thread can hold the write lock at a time. Moreover, when a thread holds the read lock, other threads are prevented from acquiring the write lock, and vice versa.

In its implementation, `ReentrantReadWriteLock` utilizes method overrides from `AbstractQueuedSynchronizer` (AQS) to realize its synchronization semantics. AQS serves as a framework for constructing locks and other synchronization components, providing a queue-based synchronization framework for building locks and other synchronization devices.

### Use Cases

`ReentrantReadWriteLock` finds its niche in scenarios where reads outnumber writes, such as in caching systems or data warehousing applications. In such environments, allowing multiple threads to read data concurrently can significantly boost system throughput.

### Analysis

Now, let's delve into the provided code. As per the characteristics of `ReentrantReadWriteLock`, the first thread acquires the read lock successfully, and the second thread attempting to acquire the write lock gets blocked. So far, everything aligns with expectations. But what about the third thread attempting to acquire the read lock again? Will it succeed or get blocked?

In accordance with `ReentrantReadWriteLock`, the third thread should successfully acquire the read lock since read locks are shared and do not block other read threads. However, in practice, the third thread gets blocked. The correct output is B:

```plain
First read lock acquired successfully
Write lock acquired
Second read lock acquired
```

Why does this happen? As mentioned earlier, `ReentrantReadWriteLock` defaults to unfair locking. But how does it achieve this? Let's take a look at the source code for `NonfairSync`:

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

Notice how the `readerShouldBlock` method in `NonfairSync` returns the result of `apparentlyFirstQueuedIsExclusive()`. This method determines whether the first node in the queue is a write node. If it is, it returns `true`; otherwise, it returns `false`. This is why the third thread gets blocked. It's essential to note that this blocking is probabilistic—it's a heuristic judgment, not an absolute one. If the first node in the queue were a read node, the third thread could successfully acquire the read lock. Although I can't think of a scenario where this would occur (if you know, feel free to enlighten me!).

Enjoyed this exploration? Stay tuned for more deep dives into Java concurrency and beyond!
