-keepattributes *Annotation*
-keepclassmembers class ** {
    @kotlinx.serialization.SerialName <fields>;
}
-keep class it.mtre_consulting.chroma.data.model.** { *; }
