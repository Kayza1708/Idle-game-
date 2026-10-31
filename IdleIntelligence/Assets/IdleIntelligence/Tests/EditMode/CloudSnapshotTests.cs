using System;
using System.IO;
using System.Linq;
using System.Text;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
namespace IdleIntelligence.Tests
{
    public sealed class CloudSnapshotTests
    {
        string dir,path;AtomicSaveStore store;GameState state;
        [SetUp]public void Setup(){dir=Path.Combine(Path.GetTempPath(),"idle-cloud-test-"+Guid.NewGuid());Directory.CreateDirectory(dir);path=Path.Combine(dir,"save.json");store=new AtomicSaveStore(path,new UnitySaveCodec());state=store.Load(100000).State;store.Save(state);}
        [TearDown]public void Cleanup(){Directory.Delete(dir,true);}
        [Test]public void SnapshotRoundTripRetainsExactNativeBytesAndOnlyStagesUntilConfirmed()
        {
            var original=File.ReadAllBytes(path);var packed=CloudSnapshotStore.Pack(original);
            CollectionAssert.AreEqual(original,CloudSnapshotStore.Unpack(packed));
            var candidate=CloudSnapshotStore.Stage(packed,Path.Combine(dir,"originals"),store);
            Assert.That(candidate.Valid,Is.True);CollectionAssert.AreEqual(original,File.ReadAllBytes(candidate.Path));CollectionAssert.AreEqual(original,File.ReadAllBytes(path));
            var advanced=state.Copy();advanced.Credits=ScientificNumber.From(1234);store.Save(advanced);
            var recovered=store.Recover(candidate.Path,candidate.Hash);Assert.That(recovered.Credits.CompareTo(state.Credits),Is.Zero);
            Assert.That(Directory.GetFiles(dir,"*.recovery-original-*").Length,Is.GreaterThan(0));
            CollectionAssert.AreEqual(original,File.ReadAllBytes(candidate.Path));
        }
        [Test]public void UnknownSaveVersionIsRetainedAndCannotReplaceLocalSave()
        {
            var original=File.ReadAllBytes(path);string json=Encoding.UTF8.GetString(original).Replace("\"version\":"+AtomicSaveStore.Version,"\"version\":999");Assert.That(json,Does.Contain("999"));var packed=CloudSnapshotStore.Pack(Encoding.UTF8.GetBytes(json));
            Assert.Throws<InvalidDataException>(()=>CloudSnapshotStore.Stage(packed,Path.Combine(dir,"originals"),store));
            Assert.That(Directory.GetFiles(Path.Combine(dir,"originals"),"*.cloud").Length,Is.EqualTo(1));CollectionAssert.AreEqual(original,File.ReadAllBytes(path));
        }
        [Test]public void DamagedPayloadIsNotACloudSuccess()
        {
            var packed=CloudSnapshotStore.Pack(Encoding.UTF8.GetBytes("{damaged original"));
            Assert.Throws<InvalidDataException>(()=>CloudSnapshotStore.Stage(packed,Path.Combine(dir,"originals"),store));
            CollectionAssert.AreEqual(packed,File.ReadAllBytes(Directory.GetFiles(Path.Combine(dir,"originals"),"*.cloud").Single()));
            Assert.That(store.Inspect(path).Valid,Is.True);
        }
        [Test]public void UnsupportedTransportIsRetainedWithoutTouchingSave()
        {
            var original=File.ReadAllBytes(path);var packed=Encoding.UTF8.GetBytes("unsupported cloud original");Assert.Throws<NotSupportedException>(()=>CloudSnapshotStore.Stage(packed,Path.Combine(dir,"originals"),store));CollectionAssert.AreEqual(original,File.ReadAllBytes(path));Assert.That(Directory.GetFiles(Path.Combine(dir,"originals")).Length,Is.EqualTo(1));
        }
        [Test]public void ExcessiveExpandedDataIsBounded()
        {
            var bytes=new byte[CloudSnapshotStore.MaxRawBytes+1];Assert.Throws<InvalidDataException>(()=>CloudSnapshotStore.Pack(bytes));Assert.Throws<InvalidDataException>(()=>CloudSnapshotStore.Unpack(new byte[CloudSnapshotStore.MaxPackedBytes+1]));
        }
    }
}
